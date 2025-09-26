import { ActionInputs, AppConfig } from '@/types/config';
import { BackupResult, RestoreResult, CommitInfo } from '@/types/github';
import { AuthTokenResponse, BackupUploadResponse, OtpResponse, OtpStatusResponse, FileUploadData, RepositoryActivationDetails } from '@/types/api';
export interface IService {
    initialize(): Promise<void>;
}
export interface IConfigService extends IService {
    validateInputs(inputs: ActionInputs): Promise<void>;
    getConfig(): AppConfig;
    getApiConfig(): AppConfig['api'];
    getCryptoConfig(): AppConfig['crypto'];
    getFileConfig(): AppConfig['files'];
}
export interface IValidationService extends IService {
    validatePassword(password: string): void;
    validateActionType(action: string): void;
    validateOtpMethod(method: string): void;
    validateRestoreInputs(fileVersionId?: string, suspendActions?: boolean): void;
}
export interface ICryptoService extends IService {
    hashPassword(password: string): string;
    encrypt(inputBuffer: Buffer, password: string): Promise<Buffer>;
    decrypt(encryptedBuffer: Buffer, password: string): Promise<Buffer>;
    decryptBackup(encryptedBuffer: Buffer, password: string): Promise<Buffer>;
    encryptArchive(filePath: string, password: string): Promise<Buffer>;
    getEncryptedFileName(password: string): string;
}
export interface ICompressionService extends IService {
    createTarArchive(sourceDir: string, outputPath: string): Promise<number>;
    compressWithZstd(inputPath: string, outputPath: string): Promise<number>;
    decompressZstd(inputPath: string, outputPath: string): Promise<void>;
    extractTarArchive(tarPath: string, extractDir: string): Promise<void>;
}
export interface IGitService extends IService {
    createMirrorClone(sourceDir: string, targetDir: string): Promise<void>;
    getCurrentCommitInfo(): Promise<CommitInfo>;
    configureGit(userName: string, userEmail: string): Promise<void>;
    setRemoteUrl(repoPath: string, remoteUrl: string): Promise<void>;
    pushMirror(repoPath: string, remoteUrl: string): Promise<void>;
    pushAllBranches(repoPath: string, remoteUrl: string): Promise<void>;
    syncRemoteBranches(repoPath: string): Promise<void>;
    filterWorkflowDirectory(repoPath: string): Promise<void>;
    configureAndPush(config: any, hasPatToken: boolean): Promise<void>;
}
export interface IApiClient extends IService {
    authenticate(activationCode: string): Promise<AuthTokenResponse>;
    uploadBackup(uploadData: FileUploadData, token: string): Promise<BackupUploadResponse>;
    requestOtp(deliveryMethod: 'MAIL' | 'AUTHENTICATOR', token: string): Promise<OtpResponse>;
    verifyOtp(uniqueKey: string, token: string): Promise<OtpStatusResponse>;
    downloadBackup(fileVersionId: string, token: string, uniqueKey: string): Promise<Buffer>;
}
export interface IOtpService extends IService {
    setAuthToken(token: string): void;
    requestOtp(deliveryMethod: 'MAIL' | 'AUTHENTICATOR'): Promise<OtpResponse>;
    waitForOtpVerification(uniqueKey: string, expiresAt: string): Promise<boolean>;
    getVerificationUrl(otpResponse: OtpResponse): string;
}
export interface IGitHubService extends IService {
    suspendActions(): Promise<void>;
    resumeActions(): Promise<void>;
    getActionsPermissions(): Promise<any>;
    setActionsPermissions(permissions: any): Promise<void>;
    getRepositoryActivationDetails(): Promise<RepositoryActivationDetails>;
}
export interface IBackupWorkflowService extends IService {
    execute(): Promise<BackupResult>;
}
export interface IRestoreWorkflowService extends IService {
    execute(fileVersionId: string): Promise<RestoreResult>;
}
export interface ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: Error): void;
    notice(message: string): void;
    debug(message: string): void;
    setSecret(secret: string): void;
}
//# sourceMappingURL=interfaces.d.ts.map