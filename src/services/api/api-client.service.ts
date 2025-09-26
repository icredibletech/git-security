import FormData from 'form-data';
import { BaseService } from '../base/base-service';
import { GitHubService } from '../github/github.service';
import { IApiClient, ILogger } from '../base/interfaces';
import * as core from '@actions/core';

import {
  AuthTokenResponse,
  BackupUploadResponse,
  OtpResponse,
  OtpStatusResponse,
  FileUploadData,
  ApiResponse,
  AuthTokenRequest,
} from '../../types/api';
import axios , { AxiosInstance } from 'axios';
import { context } from '@actions/github';
import { ConfigService } from '../config/config.service';
import { ApiConfig } from '../../types/config';


export class ApiClientService extends BaseService implements IApiClient {
  private configService: ConfigService;
  private apiConfig: ApiConfig;
  private axiosInstance: AxiosInstance;

  constructor(logger: ILogger, configService: ConfigService) {
    super(logger);
    this.configService = configService;
    this.apiConfig = configService.getApiConfig();

     this.axiosInstance = axios.create({
      baseURL: this.apiConfig.baseUrl,
      timeout: this.apiConfig.timeout,
      headers: {
        'User-Agent': this.apiConfig.userAgent,
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleAxiosError(error, 'API request failed');
      }
    );
    
  }

  protected async onInitialize(): Promise<void> {
  }


  public async authenticate(activationCode: string): Promise<AuthTokenResponse> {
    this.ensureInitialized();

    try {
      this.logger.info('Authenticating with iCredible API');

      const defaultToken = core.getInput('github-token', { required: true });
      const defaultTokenGitHubService = new GitHubService(
        this.logger,
        defaultToken,
        context.repo.owner,
        context.repo.repo,
        this.configService
      );

      await defaultTokenGitHubService.initialize();

      const activationDetails = await defaultTokenGitHubService.getRepositoryActivationDetails();
          const requestBody : AuthTokenRequest  = {
        activationCode: activationCode,
        ...activationDetails,
    };

      const response = await this.axiosInstance.post(
        '/endpoint/activation',
        requestBody
      );

      const apiResponse: ApiResponse<AuthTokenResponse> = response.data;
      if (!apiResponse.success) {
        throw new Error(`Authentication failed: ${apiResponse.error || apiResponse.message}`);
      }

      this.logger.info('Authentication successful');
      return apiResponse.data;
    } catch (error) {
      this.handleError(error, 'Failed to authenticate with iCredible API');
    }
  }

   public async uploadBackup(uploadData: FileUploadData, token: string): Promise<BackupUploadResponse> {
    this.ensureInitialized();

    try {
      this.logger.info(`Uploading backup file: ${uploadData.fileName}`);

      const form = new FormData();
      
      form.append('file', uploadData.file, {
        filename: uploadData.fileName,
        contentType: 'application/octet-stream',
      });

      form.append('Size', uploadData.size.toString());
      form.append('CompressedFileSize', uploadData.compressedFileSize.toString());
      form.append('Attributes', uploadData.attributes.toString());
      form.append('FileName', uploadData.fileName);
      form.append('CompressionEngine', uploadData.compressionEngine);
      form.append('CompressionLevel', uploadData.compressionLevel);
      form.append('FullPath', uploadData.fullPath);
      form.append('EncryptionType', uploadData.encryptionType);
      form.append('RevisionType', uploadData.revisionType.toString());

      form.append('MetaData[Event]', uploadData.metadata.event);
      form.append('MetaData[Ref]', uploadData.metadata.ref);
      form.append('MetaData[Actor]', uploadData.metadata.actor);
      form.append('MetaData[Owner]', uploadData.metadata.owner);
      form.append('MetaData[OwnerType]', uploadData.metadata.ownerType);
      
      if (uploadData.metadata.commit) {
        form.append('MetaData[Commit]', uploadData.metadata.commit);
        form.append('MetaData[CommitShort]', uploadData.metadata.commitShort);
        form.append('MetaData[Author]', uploadData.metadata.author);
        form.append('MetaData[Date]', uploadData.metadata.date);
        form.append('MetaData[Committer]', uploadData.metadata.committer);
        form.append('MetaData[Message]', uploadData.metadata.message);
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'iCredible-Git-Security/2.0',
        ...form.getHeaders(),
      };

      const response = await this.axiosInstance.post(
        '/backup/shield',
        form,
        { 
          headers: headers, 
          maxContentLength: Infinity, 
          maxBodyLength: Infinity 
        }
      );

      const apiResponse: ApiResponse<BackupUploadResponse> = response.data;

      if (!apiResponse.success) {
        throw new Error(`Upload failed: ${apiResponse.error || apiResponse.message}`);
      }

      this.logger.info('Backup uploaded successfully');
      return apiResponse.data;

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const serverError = JSON.stringify(error.response.data);
        this.handleError(
          new Error(`Upload failed: HTTP ${error.response.status} - ${serverError}`),
          'Failed to upload backup'
        );
      } else {
        this.handleError(error, 'Failed to upload backup');
      }
    }
  }

  public async requestOtp(deliveryMethod: 'MAIL' | 'AUTHENTICATOR', token: string): Promise<OtpResponse> {
    this.ensureInitialized();
    try {
      this.logger.info(`Requesting OTP via ${deliveryMethod}`);
      
      const requestBody = {
        Type: deliveryMethod,
        Source: 'FileDownload',
        OtpGenerationMode: 'Number',
      };

      const response = await this.axiosInstance.post(
        '/OTP/Send',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const apiResponse: ApiResponse<OtpResponse> = response.data;
      if (!apiResponse.success) {
        throw new Error(`OTP request failed: ${apiResponse.error || apiResponse.message}`);
      }

      this.logger.info('OTP requested successfully');
      return apiResponse.data;
    } catch (error) {
      this.handleAxiosError(error, 'Failed to request OTP');
    }
  }

  public async verifyOtp(uniqueKey: string, token: string): Promise<OtpStatusResponse> {
    this.ensureInitialized();
    try {
      const requestBody = { uniqueKey: uniqueKey };

      const response = await this.axiosInstance.post(
        '/OTP/GetOTPStatus',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const apiResponse: ApiResponse<boolean> = response.data;
      return { verified: apiResponse.success && apiResponse.data === true };
    } catch (error) {
      this.logger.warn(`OTP verification check failed: ${String(error)}`);
      return { verified: false };
    }
  }

  public async downloadBackup(fileVersionId: string, token: string, uniqueKey: string): Promise<Buffer> {
    this.ensureInitialized();
    try {
      this.logger.info(`Downloading backup with version ID: ${fileVersionId}`);
      
      const response = await this.axiosInstance.get(
        `/restore/${fileVersionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Unique-Key': uniqueKey,
            'X-Verification-Key': '1',
          },
          responseType: 'arraybuffer',
        }
      );

      const buffer = Buffer.from(response.data);
      this.logger.info(`Backup downloaded successfully. Size: ${buffer.length} bytes`);
      return buffer;

    } catch (error) {
      this.handleAxiosError(error, 'Failed to download backup');
    }
  }
  
  private handleAxiosError(error: any, contextMessage: string): never {
    if (axios.isAxiosError(error) && error.response) {
      const serverError = JSON.stringify(error.response.data);
      this.handleError(
        new Error(`${contextMessage}: HTTP ${error.response.status} - ${serverError}`),
        contextMessage
      );
    } else {
      this.handleError(error, contextMessage);
    }
  }
}
