import { promises as fs } from 'fs';
import { context } from '@actions/github';
import { BaseService } from '../base/base-service';
import { 
  IBackupWorkflowService, 
  ILogger, 
  IConfigService, 
  ICryptoService, 
  ICompressionService, 
  IGitService, 
  IApiClient 
} from '../base/interfaces';
import { BackupResult, CommitInfo } from '../../types/github';
import { AuthTokenResponse, FileUploadData } from '@/types/api';
import { DataMapper } from '../../utils/data.mapper';

export class BackupWorkflowService extends BaseService implements IBackupWorkflowService {
  private configService: IConfigService;
  private cryptoService: ICryptoService;
  private compressionService: ICompressionService;
  private gitService: IGitService;
  private apiClient: IApiClient;

  constructor(
    logger: ILogger,
    configService: IConfigService,
    cryptoService: ICryptoService,
    compressionService: ICompressionService,
    gitService: IGitService,
    apiClient: IApiClient
  ) {
    super(logger);
    this.configService = configService;
    this.cryptoService = cryptoService;
    this.compressionService = compressionService;
    this.gitService = gitService;
    this.apiClient = apiClient;
  }

  protected async onInitialize(): Promise<void> {
    // Initialize all dependent services
    await this.configService.initialize();
    await this.cryptoService.initialize();
    await this.compressionService.initialize();
    await this.gitService.initialize();
    await this.apiClient.initialize();
  }

  public async execute(): Promise<BackupResult> {
    this.ensureInitialized();

    try {
      this.logger.info('Starting backup workflow');
      const config = this.configService.getConfig();
      const startTime = Date.now();

      // Step 1: Create mirror clone
      this.logger.info('Step 1: Creating repository mirror clone');
      await this.gitService.createMirrorClone('.', config.files.sourceArchiveDir);

      // Step 2: Get commit information
      this.logger.info('Step 2: Gathering commit information');
      const commitInfo : CommitInfo = await this.gitService.getCurrentCommitInfo();

      // Step 3: Create tar archive
      this.logger.info('Step 3: Creating tar archive');
      const uncompressedSize = await this.compressionService.createTarArchive(
        config.files.sourceArchiveDir,
        config.files.tarArchiveFile
      );

      // Step 4: Compress with zstd
      this.logger.info('Step 4: Compressing archive with zstd');
      const compressedSize = await this.compressionService.compressWithZstd(
        config.files.tarArchiveFile,
        config.files.compressedArchiveFile
      );

      // Step 5: Encrypt the compressed archive
      this.logger.info('Step 5: Encrypting compressed archive');
      const encryptedBuffer = await this.cryptoService.encryptArchive(
      config.files.compressedArchiveFile,
      config.inputs.icredible_encryption_password
      );

      const encryptedFilePath = this.cryptoService.getEncryptedFileName(config.inputs.icredible_encryption_password);
      await fs.writeFile(encryptedFilePath, encryptedBuffer);
      const encryptedSize = encryptedBuffer.length;

      // Step 6: Authenticate with API
      this.logger.info('Step 6: Authenticating with iCredible API');
      const authResponse : AuthTokenResponse = await this.apiClient.authenticate(config.inputs.icredible_activation_code);

      // Step 7: Upload backup
      this.logger.info('Step 7: Uploading backup to iCredible');
      const uploadData : FileUploadData = DataMapper.createUploadData(
        encryptedBuffer,
        encryptedFilePath,
        uncompressedSize,
        encryptedSize,
        commitInfo,
        config
      );
      this.logger.info(`${console.log(uploadData)}`);
      this.logger.info(`${console.log(authResponse.token)}`);


      const uploadResponse = await this.apiClient.uploadBackup(uploadData, authResponse.token);

      // Step 8: Display summary
      this.displayBackupSummary({
        recordId: uploadResponse.recordId,
        directoryRecordId: uploadResponse.directoryRecordId,
        commitInfo,
        mgmtBaseUrl: config.api.managementBaseUrl,
        endpointId: authResponse.endpointId,
      });

      // Clean up temporary files
      await this.cleanupTemporaryFiles(config);

      this.logger.info('Backup workflow completed successfully');

      return {
        success: true,
        message: 'Backup completed successfully',
        recordId: uploadResponse.recordId,
        directoryRecordId: uploadResponse.directoryRecordId,
        fileSize: uncompressedSize,
        compressedSize,
        encryptedSize,
        commitInfo,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Backup workflow failed', error instanceof Error ? error : new Error(errorMessage));
      
      // Attempt cleanup on error
      try {
        const config = this.configService.getConfig();
        await this.cleanupTemporaryFiles(config);
      } catch (cleanupError) {
        this.logger.warn(`Cleanup failed: ${String(cleanupError)}`);
      }

      return {
        success: false,
        message: `Backup failed: ${errorMessage}`,
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  }

  private displayBackupSummary(summary: {
    recordId: string;
    directoryRecordId: string;
    commitInfo: any;
    mgmtBaseUrl: string;
    endpointId: number;
  }): void {

    let uploadMetadata = '';
    if (summary.commitInfo && summary.commitInfo.hash) {
      const message = summary.commitInfo.message || '';
      uploadMetadata = `
--------------------------------------------------
**Upload Metadata**
- Commit:      ${summary.commitInfo.hash}
- CommitShort: ${summary.commitInfo.shortHash}
- Author:      ${summary.commitInfo.author}
- Date:        ${summary.commitInfo.date}
- Committer:   ${summary.commitInfo.committer || 'GitHub'}
- Message:     ${message}
`.trim();
    }
    

    const summaryMessage = `
'🛡️ iCredible Git Security - Backup Summary'

✅ **Backup completed successfully!**
--------------------------------------------------
**Git Metadata**
Repository: ${process.env.GITHUB_REPOSITORY}
- Owner: ${context.repo.owner} [${process.env.OWNER_TYPE || 'User'}]
- Event: ${context.eventName}
- Ref:   ${context.ref}
- Actor: ${context.actor}
${uploadMetadata}
--------------------------------------------------
**API Response**
- File version id: ${summary.recordId}
- You can access the backed-up file from this link: ${summary.mgmtBaseUrl}/dashboard/file-management/${summary.endpointId}/${summary.directoryRecordId}
`.trim();

    this.logger.notice(summaryMessage);
  }

  private async cleanupTemporaryFiles(config: any): Promise<void> {
    const filesToClean = [
      config.files.sourceArchiveDir,
      config.files.tarArchiveFile,
      config.files.compressedArchiveFile,
      this.cryptoService.getEncryptedFileName(config.inputs.icredible_encryption_password),
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