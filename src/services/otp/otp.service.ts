import { BaseService } from '../base/base-service';
import { IOtpService, IApiClient, ILogger } from '../base/interfaces';
import { OtpResponse } from '@/types/api';

export class OtpService extends BaseService implements IOtpService {
  private apiClient: IApiClient;
  private token: string = '';
  private managementBaseUrl: string;

  constructor(logger: ILogger, apiClient: IApiClient, managementBaseUrl: string) {
    super(logger);
    this.apiClient = apiClient;
    this.managementBaseUrl = managementBaseUrl;
  }

  protected async onInitialize(): Promise<void> {
    await this.apiClient.initialize();
  }

  public setAuthToken(token: string): void {
    this.token = token;
  }

  public async requestOtp(deliveryMethod: 'MAIL' | 'AUTHENTICATOR'): Promise<OtpResponse> {
    this.ensureInitialized();

    if (!this.token) {
      throw new Error('Authentication token not set. Call setAuthToken first.');
    }

    try {
      const otpResponse = await this.apiClient.requestOtp(deliveryMethod, this.token);
      
      const verificationUrl = this.getVerificationUrl(otpResponse);
      this.logger.notice(`OTP sent via ${deliveryMethod}.`);
      this.logger.notice(`Please verify your OTP at: ${verificationUrl}`);
      
      return otpResponse;
    } catch (error) {
      this.handleError(error, 'Failed to request OTP');
    }
  }

  public async waitForOtpVerification(uniqueKey: string, expiresAt: string): Promise<boolean> {
    this.ensureInitialized();

    if (!this.token) {
      throw new Error('Authentication token not set');
    }

    try {
      const expirationTime = new Date(expiresAt).getTime();
      const pollingInterval = 5000; 
      
      this.logger.info('Waiting for OTP verification...');
      this.logger.info(`Verification will time out at: ${new Date(expiresAt).toLocaleString()}`);
      
      while (Date.now() < expirationTime) {
        const statusResponse = await this.apiClient.verifyOtp(uniqueKey, this.token);
        
        if (statusResponse.verified) {
          this.logger.info('✅ OTP verified successfully');
          return true;
        }
        
        this.logger.debug('OTP not yet verified, waiting...');
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
      }
      
      this.logger.error('OTP verification timed out');
      return false;
    } catch (error) {
      this.handleError(error, 'Failed to verify OTP');
    }
  }

  public getVerificationUrl(otpResponse: OtpResponse): string {
    const queryParams = new URLSearchParams({
      createdAt: otpResponse.createdAt,
      expiresAt: otpResponse.expiresAt,
      uniqueKey: otpResponse.uniqueKey,
      source: 'FileDownload',
    });

    return `${this.managementBaseUrl}/git-security/?${queryParams.toString()}`;
  }

  // Helper method for sleeping
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to check OTP status once (without polling)
  public async checkOtpStatus(uniqueKey: string): Promise<boolean> {
    this.ensureInitialized();

    if (!this.token) {
      throw new Error('Authentication token not set');
    }

    try {
      const statusResponse = await this.apiClient.verifyOtp(uniqueKey, this.token);
      return statusResponse.verified;
    } catch (error) {
      this.logger.warn(`Failed to check OTP status: ${String(error)}`);
      return false;
    }
  }

  // Method to get remaining time until OTP expires
  public getRemainingTime(expiresAt: string): number {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const remainingTime = Math.max(0, expirationTime - currentTime);
    
    return Math.ceil(remainingTime / 1000); // Return in seconds
  }

  // Method to format remaining time as human readable string
  public formatRemainingTime(expiresAt: string): string {
    const remainingSeconds = this.getRemainingTime(expiresAt);
    
    if (remainingSeconds <= 0) {
      return 'Expired';
    }
    
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  }
}