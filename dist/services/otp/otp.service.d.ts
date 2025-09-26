import { BaseService } from '../base/base-service';
import { IOtpService, IApiClient, ILogger } from '../base/interfaces';
import { OtpResponse } from '@/types/api';
export declare class OtpService extends BaseService implements IOtpService {
    private apiClient;
    private token;
    private managementBaseUrl;
    constructor(logger: ILogger, apiClient: IApiClient, managementBaseUrl: string);
    protected onInitialize(): Promise<void>;
    setAuthToken(token: string): void;
    requestOtp(deliveryMethod: 'MAIL' | 'AUTHENTICATOR'): Promise<OtpResponse>;
    waitForOtpVerification(uniqueKey: string, expiresAt: string): Promise<boolean>;
    getVerificationUrl(otpResponse: OtpResponse): string;
    private sleep;
    checkOtpStatus(uniqueKey: string): Promise<boolean>;
    getRemainingTime(expiresAt: string): number;
    formatRemainingTime(expiresAt: string): string;
}
//# sourceMappingURL=otp.service.d.ts.map