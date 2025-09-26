import { context } from '@actions/github';
import { ILogger } from '../base/interfaces';
import { GitHubActionsLogger } from '../../utils/logger';
import { ConfigService } from '../config/config.service';
import { ValidationService } from '../validation/validation.service';
import { CryptoService } from '../crypto/crypto.service';
import { CompressionService } from '../compression/compression.service';
import { GitService } from '../git/git.service';
import { ApiClientService } from '../api/api-client.service';
import { OtpService } from '../otp/otp.service';
import { GitHubService } from '../github/github.service';
import { BackupWorkflowService } from '../workflow/backup-workflow.service';
import { RestoreWorkflowService } from '../workflow/restore-workflow.service';
import { config } from 'process';
import * as core from '@actions/core';


export class ServiceContainer {
  private logger: ILogger;
  private services: Map<string, any> = new Map();

  constructor() {
    this.logger = new GitHubActionsLogger();
  }

  public getLogger(): ILogger {
    return this.logger;
  }

  public getConfigService(): ConfigService {
    if (!this.services.has('config')) {
      const validationService = this.getValidationService();
      this.services.set('config', new ConfigService(this.logger, validationService));
    }
    return this.services.get('config');
  }

  public getValidationService(): ValidationService {
    if (!this.services.has('validation')) {
      this.services.set('validation', new ValidationService(this.logger));
    }
    return this.services.get('validation');
  }

  public getCryptoService(): CryptoService {
    if (!this.services.has('crypto')) {
      this.services.set('crypto', new CryptoService(this.logger));
    }
    return this.services.get('crypto');
  }

  public getCompressionService(): CompressionService {
    if (!this.services.has('compression')) {
      this.services.set('compression', new CompressionService(this.logger));
    }
    return this.services.get('compression');
  }

  public getGitService(): GitService {
    if (!this.services.has('git')) {
      this.services.set('git', new GitService(this.logger));
    }
    return this.services.get('git');
  }

  public getApiClient(): ApiClientService {

    if (!this.services.has('api')) {
      const config = this.getConfigService();
      this.services.set('api', new ApiClientService(this.logger, config));
    }
    return this.services.get('api');
  }

  public getOtpService(): OtpService {
    if (!this.services.has('otp')) {
      const apiClient = this.getApiClient();
      const config = this.getConfigService().getApiConfig();
      this.services.set('otp', new OtpService(this.logger, apiClient, config.managementBaseUrl));
    }
    return this.services.get('otp');
  }

  public getGitHubService(token?: string): GitHubService | null {
    if (!token) {
      return null;
    }

    const configService = this.getConfigService();
    const serviceKey = `github_${token.substring(0, 8)}`;
    if (!this.services.has(serviceKey)) {
      this.services.set(serviceKey, new GitHubService(
        this.logger,
        token,
        context.repo.owner,
        context.repo.repo,
        configService
      ));
    }
    return this.services.get(serviceKey);
  }

  public getBackupWorkflowService(): BackupWorkflowService {
    if (!this.services.has('backup-workflow')) {
      this.services.set('backup-workflow', new BackupWorkflowService(
        this.logger,
        this.getConfigService(),
        this.getCryptoService(),
        this.getCompressionService(),
        this.getGitService(),
        this.getApiClient()
      ));
    }
    return this.services.get('backup-workflow');
  }

  public getRestoreWorkflowService(patToken?: string): RestoreWorkflowService {
    const serviceKey = patToken ? `restore-workflow-${patToken.substring(0, 8)}` : 'restore-workflow';
    
    if (!this.services.has(serviceKey)) {
      this.services.set(serviceKey, new RestoreWorkflowService(
        this.logger,
        this.getConfigService(),
        this.getCryptoService(),
        this.getCompressionService(),
        this.getGitService(),
        this.getApiClient(),
        this.getOtpService(),
        this.getGitHubService(patToken) || undefined
      ));
    }
    return this.services.get(serviceKey);
  }

  // Initialize all services that require initialization
  public async initializeServices(): Promise<void> {
    try {
      this.logger.info('Initializing services...');
      
      // Initialize core services first
      await this.getValidationService().initialize();
      await this.getConfigService().initialize();
      await this.getCryptoService().initialize();
      await this.getCompressionService().initialize();
      await this.getGitService().initialize();
      await this.getApiClient().initialize();
      
      this.logger.info('Core services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize services', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Cleanup method to dispose of services if needed
  public dispose(): void {
    this.logger.debug('Disposing service container');
    this.services.clear();
  }

  // Utility method to validate configuration
  public async validateConfiguration(): Promise<void> {
    const configService = this.getConfigService();
    const config = configService.getConfig();
    
    await configService.validateInputs(config.inputs);
    this.logger.info('Configuration validation completed');
  }

  // Method to mask sensitive information in logs
  public maskSecrets(): void {
    const config = this.getConfigService().getConfig();
    
    // Mask the encryption password and activation code in logs
    this.logger.setSecret(config.inputs.icredible_encryption_password);
    this.logger.setSecret(config.inputs.icredible_activation_code);
    
    if (config.inputs.icredible_repository_restore_token) {
      this.logger.setSecret(config.inputs.icredible_repository_restore_token);
    }

    this.logger.debug('Sensitive information masked in logs');
  }
}