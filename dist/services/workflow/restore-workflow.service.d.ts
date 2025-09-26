import { BaseService } from '../base/base-service';
import { IRestoreWorkflowService, ILogger, IConfigService, ICryptoService, ICompressionService, IGitService, IApiClient, IOtpService, IGitHubService } from '../base/interfaces';
import { RestoreResult } from '@/types/github';
export declare class RestoreWorkflowService extends BaseService implements IRestoreWorkflowService {
    private configService;
    private cryptoService;
    private compressionService;
    private gitService;
    private apiClient;
    private otpService;
    private githubService;
    constructor(logger: ILogger, configService: IConfigService, cryptoService: ICryptoService, compressionService: ICompressionService, gitService: IGitService, apiClient: IApiClient, otpService: IOtpService, githubService?: IGitHubService);
    protected onInitialize(): Promise<void>;
    execute(fileVersionId: string): Promise<RestoreResult>;
    private displayRestoreSummary;
    private cleanupTemporaryFiles;
}
//# sourceMappingURL=restore-workflow.service.d.ts.map