import { ServiceContainer } from '../services/container/service-container';

// Mock environment variables for testing
process.env.INPUT_ICREDIBLE_ACTIVATION_CODE = 'activation-code';
process.env.INPUT_ICREDIBLE_ENCRYPTION_PASSWORD = 'TestPassword123!';
process.env.INPUT_ACTION = 'backup';
process.env.INPUT_SUSPEND_ACTIONS = 'true';
process.env.INPUT_OTP_DELIVERY_METHOD = 'MAIL';
process.env.GITHUB_REPOSITORY = 'test-owner/test-repo';

describe('ServiceContainer', () => {
  let container: ServiceContainer;

  beforeEach(async () => {
    container = new ServiceContainer();
    await container.initializeServices();
  });

  afterEach(() => {
    container.dispose();
  });

  describe('service initialization', () => {
    it('should create logger instance', () => {
      const logger = container.getLogger();
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should create config service', () => {
      const configService = container.getConfigService();
      expect(configService).toBeDefined();
    });

    it('should create validation service', () => {
      const validationService = container.getValidationService();
      expect(validationService).toBeDefined();
    });

    it('should create crypto service', () => {
      const cryptoService = container.getCryptoService();
      expect(cryptoService).toBeDefined();
    });

    it('should create compression service', () => {
      const compressionService = container.getCompressionService();
      expect(compressionService).toBeDefined();
    });

    it('should create git service', () => {
      const gitService = container.getGitService();
      expect(gitService).toBeDefined();
    });

    it('should create API client', () => {
      const apiClient = container.getApiClient();
      expect(apiClient).toBeDefined();
    });

    it('should create OTP service', () => {
      const otpService = container.getOtpService();
      expect(otpService).toBeDefined();
    });

    it('should create backup workflow service', () => {
      const backupWorkflow = container.getBackupWorkflowService();
      expect(backupWorkflow).toBeDefined();
    });

    it('should create restore workflow service', () => {
      const restoreWorkflow = container.getRestoreWorkflowService();
      expect(restoreWorkflow).toBeDefined();
    });
  });

  describe('service caching', () => {
    it('should return the same instance for multiple calls', () => {
      const config1 = container.getConfigService();
      const config2 = container.getConfigService();
      expect(config1).toBe(config2);
    });

    it('should return the same crypto service instance', () => {
      const crypto1 = container.getCryptoService();
      const crypto2 = container.getCryptoService();
      expect(crypto1).toBe(crypto2);
    });
  });

  describe('GitHub service creation', () => {
    it('should return null when no token provided', () => {
      const githubService = container.getGitHubService();
      expect(githubService).toBeNull();
    });

    it('should create GitHub service with token', () => {
      const githubService = container.getGitHubService('test-token');
      expect(githubService).toBeDefined();
    });

    it('should cache GitHub services by token', () => {
      const service1 = container.getGitHubService('test-token-123');
      const service2 = container.getGitHubService('test-token-123');
      const service3 = container.getGitHubService('different-token');

      expect(service1).toBe(service2);
      expect(service1).not.toBe(service3);
    });
  });

  describe('initialization methods', () => {
    it('should initialize services without throwing', async () => {
      await expect(container.initializeServices()).resolves.not.toThrow();
    });

    it('should validate configuration without throwing', async () => {
      await container.initializeServices();
      await expect(container.validateConfiguration()).resolves.not.toThrow();
    });

    it('should mask secrets without throwing', async () => {
      await container.initializeServices();
      expect(() => container.maskSecrets()).not.toThrow();
    });
  });

  describe('disposal', () => {
    it('should dispose without throwing', () => {
      expect(() => container.dispose()).not.toThrow();
    });
  });
});
