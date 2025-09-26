import { BaseService } from '../base/base-service';
import { IBackupWorkflowService, ILogger, IConfigService, ICryptoService, ICompressionService, IGitService, IApiClient } from '../base/interfaces';
import { BackupResult } from '../../types/github';
export declare class BackupWorkflowService extends BaseService implements IBackupWorkflowService {
    private configService;
    private cryptoService;
    private compressionService;
    private gitService;
    private apiClient;
    constructor(logger: ILogger, configService: IConfigService, cryptoService: ICryptoService, compressionService: ICompressionService, gitService: IGitService, apiClient: IApiClient);
    protected onInitialize(): Promise<void>;
    execute(): Promise<BackupResult>;
    private displayBackupSummary;
    private cleanupTemporaryFiles;
}
//# sourceMappingURL=backup-workflow.service.d.ts.map