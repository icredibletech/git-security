export interface GitHubContext {
    repository: string;
    owner: string;
    ref: string;
    sha: string;
    actor: string;
    eventName: string;
    runId: number;
    runNumber: number;
    ownerType: 'User' | 'Organization';
}
export interface ActionResult {
    success: boolean;
    message: string;
    data?: any;
    error?: Error;
}
export interface BackupResult extends ActionResult {
    recordId?: string;
    directoryRecordId?: string;
    fileSize?: number;
    compressedSize?: number;
    encryptedSize?: number;
    commitInfo?: CommitInfo;
}
export interface RestoreResult extends ActionResult {
    fileVersionId?: string;
    restoredCommit?: string;
    branchesRestored?: string[];
    workflowsSuspended?: boolean;
}
export interface CommitInfo {
    hash: string;
    shortHash: string;
    author: string;
    date: string;
    message: string;
    parents: string;
}
export interface GitHubActionsPermissions {
    enabled: boolean;
    allowed_actions?: string;
    selected_actions_url?: string;
}
export interface WorkflowSuspensionState {
    originalPermissions: GitHubActionsPermissions;
    suspendedAt: string;
    actionsPermissionsFilePath: string;
}
//# sourceMappingURL=github.d.ts.map