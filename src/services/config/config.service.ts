import { BaseService } from '../base/base-service';
import { IConfigService, IValidationService, ILogger } from '../base/interfaces';
import { ActionInputs, AppConfig } from '@/types/config';

export class ConfigService extends BaseService implements IConfigService {
  private config: AppConfig | null = null;
  private validationService: IValidationService;

  constructor(logger: ILogger, validationService: IValidationService) {
    super(logger);
    this.validationService = validationService;
  }

  protected async onInitialize(): Promise<void> {
    await this.validationService.initialize();
    this.config = this.buildConfig();
  }

  public async validateInputs(inputs: ActionInputs): Promise<void> {
    this.ensureInitialized();
    
    this.validationService.validatePassword(inputs.icredible_encryption_password);
    this.validationService.validateActionType(inputs.action);
    this.validationService.validateOtpMethod(inputs.otp_delivery_method);
    
    if (inputs.action === 'restore') {
      this.validationService.validateRestoreInputs(
        inputs.file_version_id,
        inputs.suspend_actions
      );
    }
  }

  public getConfig(): AppConfig {
    this.ensureInitialized();
    if (!this.config) {
      throw new Error('Configuration not properly initialized');
    }
    return this.config;
  }

  public getApiConfig(): AppConfig['api'] {
    return this.getConfig().api;
  }

  public getCryptoConfig(): AppConfig['crypto'] {
    return this.getConfig().crypto;
  }

   public getEnpointConfig(): AppConfig['endpoint'] {
    return this.getConfig().endpoint;
  }

  public getFileConfig(): AppConfig['files'] {
    return this.getConfig().files;
  }

  private buildConfig(): AppConfig {
    const inputs = this.getInputsFromEnvironment();
    
    return {
      inputs,
      api: {
        baseUrl: 'https://staging.api.file-security.icredible.com',
        managementBaseUrl: 'https://staging.management.file-security.icredible.com',
        timeout: 30000,
        userAgent: 'iCredible-Git-Security/2.0',
      },
      crypto: {
        algorithm: 'aes-256-cbc',
        keyDerivation: 'pbkdf2',
        compressionLevel: 10,
        hashAlgorithm: 'sha256',
      },
      files: {
        sourceArchiveDir: 'repo-mirror',
        tarArchiveFile: 'repo-mirror.tar',
        compressedArchiveFile: 'repo-mirror.tar.zst',
        encryptedArchiveFile: 'repo-mirror.tar.zst.enc',
      },
      endpoint: {
        endpointType: 'PC'
      },
      git: {
        userName: 'iCredible Git Security',
        userEmail: 'icredible-git-sec@icredible.com',
      },
      otp: {
        sourceType: 'FileDownload',
        generationMode: 'Number',
        endpointType: 'Workstation',
        verificationKey: '1',
      },
      upload: {
        attributes: 32,
        compressionEngine: 'None',
        compressionLevel: 'NoCompression',
        encryptionType: 'None',
        revisionType: 1,
      },
    };
  }

  private getInputsFromEnvironment(): ActionInputs {
    const getInput = (name: string, required = true): string => {
      const value = process.env[`INPUT_${name.toUpperCase()}`] || '';
      if (required && !value) {
        throw new Error(`Required input '${name}' is missing`);
      }
      return value;
    };

    const getBooleanInput = (name: string, defaultValue = false): boolean => {
      const value = getInput(name, false).toLowerCase();
      if (value === 'true') return true;
      if (value === 'false') return false;
      return defaultValue;
    };

    return {
      icredible_activation_code: getInput('icredible_activation_code'),
      icredible_encryption_password: getInput('icredible_encryption_password'),
      action: getInput('action', false) as 'backup' | 'restore' || 'backup',
      file_version_id: getInput('file_version_id', false),
      icredible_repository_restore_token: getInput('icredible_repository_restore_token', false),
      suspend_actions: getBooleanInput('suspend_actions', true),
      otp_delivery_method: getInput('otp_delivery_method', false) as 'MAIL' | 'AUTHENTICATOR' || 'MAIL',
    };
  }
}