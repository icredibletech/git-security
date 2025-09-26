import { ILogger } from '../base/interfaces';
import { ConfigService } from '../config/config.service';
import { ValidationService } from '../validation/validation.service';
import { CryptoService } from '../crypto/crypto.service';
import { CompressionService } from '../compression/compression.service';
import { GitService } from '../git/git.service';
import { ApiClientService } from '../api/api-client.service';
import { OtpService } from '../otp/otp.service';
import { GitHubService } from '../github/github.service';
import { BackupWorkflowService } from '../workflow/backup-workflow.service';
import { RestoreWorkflowService } from '../workflow/restore-workflow.service';
export declare class ServiceContainer {
    private logger;
    private services;
    constructor();
    getLogger(): ILogger;
    getConfigService(): ConfigService;
    getValidationService(): ValidationService;
    getCryptoService(): CryptoService;
    getCompressionService(): CompressionService;
    getGitService(): GitService;
    getApiClient(): ApiClientService;
    getOtpService(): OtpService;
    getGitHubService(token?: string): GitHubService | null;
    getBackupWorkflowService(): BackupWorkflowService;
    getRestoreWorkflowService(patToken?: string): RestoreWorkflowService;
    initializeServices(): Promise<void>;
    dispose(): void;
    validateConfiguration(): Promise<void>;
    maskSecrets(): void;
}
//# sourceMappingURL=service-container.d.ts.map