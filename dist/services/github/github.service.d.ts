import { BaseService } from '../base/base-service';
import { IConfigService, IGitHubService, ILogger } from '../base/interfaces';
import { GitHubActionsPermissions } from '@/types/github';
import { RepositoryActivationDetails } from '@/types/api';
export declare class GitHubService extends BaseService implements IGitHubService {
    private octokit;
    private owner;
    private repo;
    private suspensionState;
    private actionsPermissionsFilePath;
    private configService;
    constructor(logger: ILogger, token: string, owner: string, repo: string, configService: IConfigService, actionsPermissionsFilePath?: string);
    protected onInitialize(): Promise<void>;
    suspendActions(): Promise<void>;
    resumeActions(): Promise<void>;
    getActionsPermissions(): Promise<GitHubActionsPermissions>;
    setActionsPermissions(permissions: GitHubActionsPermissions): Promise<void>;
    areActionsEnabled(): Promise<boolean>;
    getRepositoryInfo(): Promise<any>;
    getRepositoryActivationDetails(): Promise<RepositoryActivationDetails>;
}
//# sourceMappingURL=github.service.d.ts.map