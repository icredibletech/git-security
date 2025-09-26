import { BaseService } from '../base/base-service';
import { IGitService, ILogger } from '../base/interfaces';
import { CommitInfo } from '@/types/github';
export declare class GitService extends BaseService implements IGitService {
    private isFilterRepoAvailable;
    constructor(logger: ILogger);
    protected onInitialize(): Promise<void>;
    createMirrorClone(sourceDir: string, targetDir: string): Promise<void>;
    getCurrentCommitInfo(): Promise<CommitInfo>;
    configureGit(userName: string, userEmail: string): Promise<void>;
    setRemoteUrl(repoPath: string, remoteUrl: string): Promise<void>;
    pushMirror(repoPath: string, remoteUrl: string): Promise<void>;
    pushAllBranches(repoPath: string, remoteUrl: string): Promise<void>;
    syncRemoteBranches(repoPath: string): Promise<void>;
    private setupGitFilterRepo;
    filterWorkflowDirectory(repoPath: string): Promise<void>;
    hasCommits(repoPath?: string): Promise<boolean>;
    getCurrentBranch(repoPath?: string): Promise<string>;
    configureAndPush(config: any, hasPatToken: boolean): Promise<void>;
}
//# sourceMappingURL=git.service.d.ts.map