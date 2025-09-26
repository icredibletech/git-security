import { promises as fs } from 'fs';
import { context } from '@actions/github';
import { BaseService } from '../base/base-service';
import { 
  IRestoreWorkflowService, 
  ILogger, 
  IConfigService, 
  ICryptoService, 
  ICompressionService, 
  IGitService, 
  IApiClient,
  IOtpService,
  IGitHubService
} from '../base/interfaces';
import { RestoreResult } from '@/types/github';

export class RestoreWorkflowService extends BaseService implements IRestoreWorkflowService {
  private configService: IConfigService;
  private cryptoService: ICryptoService;
  private compressionService: ICompressionService;
  private gitService: IGitService;
  private apiClient: IApiClient;
  private otpService: IOtpService;
  private githubService: IGitHubService | null = null;

  constructor(
    logger: ILogger,
    configService: IConfigService,
    cryptoService: ICryptoService,
    compressionService: ICompressionService,
    gitService: IGitService,
    apiClient: IApiClient,
    otpService: IOtpService,
    githubService?: IGitHubService
  ) {
    super(logger);
    this.configService = configService;
    this.cryptoService = cryptoService;
    this.compressionService = compressionService;
    this.gitService = gitService;
    this.apiClient = apiClient;
    this.otpService = otpService;
    this.githubService = githubService || null;
  }

  protected async onInitialize(): Promise<void> {
    // Initialize all dependent services
    await this.configService.initialize();
    await this.cryptoService.initialize();
    await this.compressionService.initialize();
    await this.gitService.initialize();
    await this.apiClient.initialize();
    await this.otpService.initialize();
    
    if (this.githubService) {
      await this.githubService.initialize();
    }
  }

  public async execute(fileVersionId: string): Promise<RestoreResult> {
    this.ensureInitialized();

    let actionsWereSuspended = false;

    try {
      this.logger.info('Starting restore workflow');
      const config = this.configService.getConfig();
      const startTime = Date.now();

      // Step 1: Authenticate with API
      this.logger.info('Step 1: Authenticating with iCredible API');
      const authResponse = await this.apiClient.authenticate(config.inputs.icredible_activation_code);
      this.otpService.setAuthToken(authResponse.token);

      // Step 2: Request OTP
      this.logger.info('Step 2: Requesting OTP verification');
      const otpResponse = await this.otpService.requestOtp(config.inputs.otp_delivery_method);
      
      // Step 3: Wait for OTP verification
      this.logger.info('Step 3: Waiting for OTP verification');
      const otpVerified = await this.otpService.waitForOtpVerification(
        otpResponse.uniqueKey, 
        otpResponse.expiresAt
      );
      
      if (!otpVerified) {
        throw new Error('OTP verification failed or timed out');
      }

      // Step 4: Download backup
      this.logger.info('Step 4: Downloading backup archive');
      const encryptedBuffer = await this.apiClient.downloadBackup(
        fileVersionId, 
        authResponse.token, 
        otpResponse.uniqueKey
      );

      // Step 5: Decrypt backup
      this.logger.info('Step 5: Decrypting backup archive');
      const compressedBuffer = await this.cryptoService.decryptBackup(
        encryptedBuffer,
        config.inputs.icredible_encryption_password
      );

      // Save compressed file temporarily
      const compressedFilePath = config.files.compressedArchiveFile;
      await fs.writeFile(compressedFilePath, compressedBuffer);

      // Step 6: Decompress backup
      this.logger.info('Step 6: Decompressing backup archive');
      const tarFilePath = config.files.tarArchiveFile;
      await this.compressionService.decompressZstd(compressedFilePath, tarFilePath);

      // Step 7: Extract tar archive
      this.logger.info('Step 7: Extracting repository archive');
      const extractDir = './';
      await this.compressionService.extractTarArchive(tarFilePath, extractDir);

      // Step 8: Prepare repository based on token availability
      const hasPatToken = !!config.inputs.icredible_repository_restore_token;
      
      if (hasPatToken) {
        this.logger.info('Step 8a: Syncing remote branches (PAT token available)');
        await this.gitService.syncRemoteBranches(config.files.sourceArchiveDir);
      } else {
        this.logger.info('Step 8b: Filtering workflow directory (default token)');
        await this.gitService.filterWorkflowDirectory(config.files.sourceArchiveDir);
      }

      // Step 9: Suspend GitHub Actions if requested
      if (config.inputs.suspend_actions && this.githubService && hasPatToken) {
        this.logger.info('Step 9: Suspending GitHub Actions');
        await this.githubService.suspendActions();
        actionsWereSuspended = true;
      }

      // Step 10: Configure git and push
      this.logger.info('Step 10: Configuring git and pushing to repository');
      await this.gitService.configureAndPush(config, hasPatToken);

      // Step 11: Resume GitHub Actions if they were suspended
      if (actionsWereSuspended && this.githubService) {
        this.logger.info('Step 11: Resuming GitHub Actions');
        await this.githubService.resumeActions();
        actionsWereSuspended = false;
      }

      // Clean up temporary files
      await this.cleanupTemporaryFiles(config);

      const executionTime = Date.now() - startTime;
      this.displayRestoreSummary({
        fileVersionId,
        executionTime,
        actionsWereSuspended: config.inputs.suspend_actions && hasPatToken,
      });

      this.logger.info('Restore workflow completed successfully');

      return {
        success: true,
        message: 'Restore completed successfully',
        fileVersionId,
        workflowsSuspended: config.inputs.suspend_actions && hasPatToken,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Restore workflow failed', error instanceof Error ? error : new Error(errorMessage));
      
      // Ensure Actions are resumed if they were suspended
      if (actionsWereSuspended && this.githubService) {
        try {
          this.logger.info('Attempting to resume GitHub Actions after failure');
          await this.githubService.resumeActions();
        } catch (resumeError) {
          this.logger.error('Failed to resume GitHub Actions', resumeError instanceof Error ? resumeError : new Error(String(resumeError)));
        }
      }

      // Attempt cleanup on error
      try {
        const config = this.configService.getConfig();
        await this.cleanupTemporaryFiles(config);
      } catch (cleanupError) {
        this.logger.warn(`Cleanup failed: ${String(cleanupError)}`);
      }

      return {
        success: false,
        message: `Restore failed: ${errorMessage}`,
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  }

  private displayRestoreSummary(summary: {
    fileVersionId: string;
    executionTime: number;
    actionsWereSuspended: boolean;
  }): void {
    const executionTimeSeconds = (summary.executionTime / 1000).toFixed(1);

    const summaryMessage = `
## 🔄 iCredible Git Security - Restore Summary

### ✅ Restore Completed Successfully

**Repository Information:**
- **Repository:** ${context.repo.owner}/${context.repo.repo}
- **File Version ID:** \`${summary.fileVersionId}\`
- **Execution Time:** ${executionTimeSeconds}s

**Restore Details:**
- ✅ OTP verification completed
- ✅ Backup downloaded and decrypted
- ✅ Repository data extracted and restored
- ✅ Git history and branches restored
${summary.actionsWereSuspended ? '- ✅ GitHub Actions were safely suspended and resumed' : '- ℹ️ GitHub Actions remained active during restore'}

**Security:**
- ✅ Multi-factor authentication (OTP) verified
- ✅ AES-256-CBC decryption applied
- ✅ Repository integrity maintained

Your repository has been successfully restored from the encrypted backup.

⚠️ **Important:** All previous repository history has been overwritten with the restored backup.
`.trim();

    this.logger.notice(summaryMessage);
  }

  private async cleanupTemporaryFiles(config: any): Promise<void> {
    const filesToClean = [
      config.files.sourceArchiveDir,
      config.files.tarArchiveFile,
      config.files.compressedArchiveFile,
    ];

    for (const file of filesToClean) {
      try {
        await fs.rm(file, { recursive: true, force: true });
        this.logger.debug(`Cleaned up: ${file}`);
      } catch (error) {
        this.logger.debug(`Could not clean up ${file}: ${String(error)}`);
      }
    }
  }
}