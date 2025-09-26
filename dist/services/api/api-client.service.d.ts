import { BaseService } from '../base/base-service';
import { IApiClient, ILogger } from '../base/interfaces';
import { AuthTokenResponse, BackupUploadResponse, OtpResponse, OtpStatusResponse, FileUploadData } from '../../types/api';
import { ConfigService } from '../config/config.service';
export declare class ApiClientService extends BaseService implements IApiClient {
    private configService;
    private apiConfig;
    private axiosInstance;
    constructor(logger: ILogger, configService: ConfigService);
    protected onInitialize(): Promise<void>;
    authenticate(activationCode: string): Promise<AuthTokenResponse>;
    uploadBackup(uploadData: FileUploadData, token: string): Promise<BackupUploadResponse>;
    requestOtp(deliveryMethod: 'MAIL' | 'AUTHENTICATOR', token: string): Promise<OtpResponse>;
    verifyOtp(uniqueKey: string, token: string): Promise<OtpStatusResponse>;
    downloadBackup(fileVersionId: string, token: string, uniqueKey: string): Promise<Buffer>;
    private handleAxiosError;
}
//# sourceMappingURL=api-client.service.d.ts.map