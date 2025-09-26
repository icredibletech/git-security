export interface ActionInputs {
    icredible_activation_code: string;
    icredible_encryption_password: string;
    action: 'backup' | 'restore';
    file_version_id?: string;
    icredible_repository_restore_token?: string;
    suspend_actions: boolean;
    otp_delivery_method: 'MAIL' | 'AUTHENTICATOR';
}
export interface ApiConfig {
    baseUrl: string;
    managementBaseUrl: string;
    timeout: number;
    userAgent: string;
}
export interface CryptoConfig {
    algorithm: string;
    keyDerivation: string;
    compressionLevel: number;
    hashAlgorithm: string;
}
export interface FileConfig {
    sourceArchiveDir: string;
    tarArchiveFile: string;
    compressedArchiveFile: string;
    encryptedArchiveFile: string;
}
export interface EndpointConfig {
    endpointType: string;
}
export interface GitConfig {
    userName: string;
    userEmail: string;
}
export interface OtpConfig {
    sourceType: string;
    generationMode: string;
    endpointType: string;
    verificationKey: string;
}
export interface UploadConfig {
    attributes: number;
    compressionEngine: string;
    compressionLevel: string;
    encryptionType: string;
    revisionType: number;
}
export interface AppConfig {
    inputs: ActionInputs;
    api: ApiConfig;
    crypto: CryptoConfig;
    endpoint: EndpointConfig;
    files: FileConfig;
    git: GitConfig;
    otp: OtpConfig;
    upload: UploadConfig;
}
//# sourceMappingURL=config.d.ts.map