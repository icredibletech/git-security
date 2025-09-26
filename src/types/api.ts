export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AuthTokenRequest {
  activationCode: string;
  uniqueId: string;
  ip?: string;
  operatingSystem?: string; // Windows, Linux, IOS, IpadOS, MacOS
  endpointType?: string; // PC, Mobile, Server, Workstation, IOT, Multimedia
  endpointName: string;
}

export interface RepositoryActivationDetails {
  uniqueId: string;
  operatingSystem: 'Linux' | 'Windows' | 'MacOS';
  endpointName: string;
  ip: string; // Bu hala workflow'dan gelmeli
  endpointType: string;
}

export interface AuthTokenResponse {
  endpointCode: string;
  endpointId: number;
  endpointName: string;
  token: string;
  refreshtoken: string;
  userId: number;
  ip: string;
  uniqueId: string;
  activationCode: string;
  operatingSystem: string | null;
  endpointType: string | null;
  specialPassword: string | null;
}

export interface BackupUploadResponse {
  recordId: string;
  directoryRecordId: string;
  fileRecordId: string;
}

export interface OtpRequest {
  Type: 'MAIL' | 'AUTHENTICATOR';
  Source: string; //FileDownload
  OtpGenerationMode: string; //number
}

export interface OtpResponse {
  uniqueKey: string;
  createdAt: string;
  expiresAt: string;
}

export interface OtpStatusRequest {
  uniqueKey: string;
}

export interface OtpStatusResponse {
  verified: boolean;
}

export interface RestoreRequest {
  fileVersionId: string;
  authorization: string;
  uniqueKey: string;
}

export interface CommitMetadata {
  commit: string;
  commitShort: string;
  parents: string;
  author: string;
  date: string;
  committer: string;
  message: string;
}

export interface BackupMetadata extends CommitMetadata {
  event: string;
  ref: string;
  actor: string;
  owner: string;
  ownerType: string;
}

export enum CompressionEngine {
  None = 0,
  Zip = 1,
  GZip = 2,
  Brotli = 3,
}

export enum CompressionLevel {
  Optimal = 0,
  Fastest = 1,
  NoCompression = 2,
  SmallestSize = 3,
}

export enum EncryptionType {
  None = 0,
  ChaCha20Poly1305 = 1,
  Aes = 2,
}

export interface FileUploadData {
  file: Buffer;
  size: number;
  compressedFileSize: number;
  attributes: number;
  fileName: string;
  fullPath: string;
  compressionEngine:
    | CompressionEngine
    | keyof typeof CompressionEngine
    | string;
  compressionLevel: CompressionLevel | keyof typeof CompressionLevel | string;
  encryptionType: EncryptionType | keyof typeof EncryptionType | string;
  revisionType: number;
  metadata: BackupMetadata;
}
