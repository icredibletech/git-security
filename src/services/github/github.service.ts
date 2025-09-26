import { getOctokit } from '@actions/github';
import { promises as fs } from 'fs';
import { BaseService } from '../base/base-service';
import { IConfigService, IGitHubService, ILogger } from '../base/interfaces';
import { GitHubActionsPermissions, WorkflowSuspensionState } from '@/types/github';
import { RepositoryActivationDetails } from '@/types/api';
import { config } from 'process';

export class GitHubService extends BaseService implements IGitHubService {
  private octokit: ReturnType<typeof getOctokit> | null = null;
  private owner: string;
  private repo: string;
  private suspensionState: WorkflowSuspensionState | null = null;
  private actionsPermissionsFilePath: string;
  private configService: IConfigService;
  

  constructor(
    logger: ILogger,
    token: string,
    owner: string,
    repo: string,
    configService: IConfigService,
    actionsPermissionsFilePath: string = '/tmp/actions_permissions.json'
  ) {
    super(logger);
    this.configService = configService;
    this.owner = owner;
    this.repo = repo;
    this.actionsPermissionsFilePath = actionsPermissionsFilePath;
    
    if (token) {
      this.octokit = getOctokit(token);
    }
  }

  protected async onInitialize(): Promise<void> {
    if (!this.octokit) {
      this.logger.warn('No GitHub token provided - GitHub Actions suspension/resumption will not be available');
    }
  }

  public async suspendActions(): Promise<void> {
    this.ensureInitialized();

    if (!this.octokit) {
      throw new Error('GitHub token not available for Actions management');
    }

    try {
      this.logger.info('Suspending GitHub Actions for repository');
      
      // Get current permissions
      const currentPermissions = await this.getActionsPermissions();
      
      // Save current state
      this.suspensionState = {
        originalPermissions: currentPermissions,
        suspendedAt: new Date().toISOString(),
        actionsPermissionsFilePath: this.actionsPermissionsFilePath,
      };
      
      // Save to file as backup
      await fs.writeFile(
        this.actionsPermissionsFilePath,
        JSON.stringify(this.suspensionState, null, 2)
      );
      
      // Disable Actions
      await this.setActionsPermissions({ enabled: false });
      
      this.logger.info('GitHub Actions suspended successfully');
    } catch (error) {
      this.handleError(error, 'Failed to suspend GitHub Actions');
    }
  }

  public async resumeActions(): Promise<void> {
    this.ensureInitialized();

    if (!this.octokit) {
      this.logger.warn('GitHub token not available - cannot resume Actions');
      return;
    }

    try {
      this.logger.info('Resuming GitHub Actions for repository');
      
      let suspensionState = this.suspensionState;
      
      // If no in-memory state, try to load from file
      if (!suspensionState) {
        try {
          const stateData = await fs.readFile(this.actionsPermissionsFilePath, 'utf-8');
          suspensionState = JSON.parse(stateData) as WorkflowSuspensionState;
        } catch (error) {
          this.logger.warn('Could not load suspension state from file, using default permissions');
        }
      }
      
      // Restore original permissions or enable with defaults
      if (suspensionState?.originalPermissions) {
        await this.setActionsPermissions(suspensionState.originalPermissions);
      } else {
        // Default: enable Actions
        await this.setActionsPermissions({ enabled: true });
      }
      
      // Clean up state file
      try {
        await fs.unlink(this.actionsPermissionsFilePath);
      } catch (error) {
        this.logger.debug('Could not remove actions permissions file (it may not exist)');
      }
      
      this.suspensionState = null;
      this.logger.info('GitHub Actions resumed successfully');
    } catch (error) {
      // Don't fail the entire operation if resume fails
      this.logger.error('Failed to resume GitHub Actions', error instanceof Error ? error : new Error(String(error)));
      
      // Try a few more times
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          this.logger.info(`Retry attempt ${attempt} to resume GitHub Actions`);
          await this.setActionsPermissions({ enabled: true });
          this.logger.info('GitHub Actions resumed on retry');
          return;
        } catch (retryError) {
          this.logger.warn(`Retry ${attempt} failed: ${String(retryError)}`);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          }
        }
      }
      
      this.logger.error('All retry attempts failed - GitHub Actions may remain disabled');
    }
  }

  public async getActionsPermissions(): Promise<GitHubActionsPermissions> {
    this.ensureInitialized();

    if (!this.octokit) {
      throw new Error('GitHub token not available');
    }

    try {
      const response = await this.octokit.rest.actions.getGithubActionsPermissionsRepository({
        owner: this.owner,
        repo: this.repo,
      });

      return {
        enabled: response.data.enabled,
        allowed_actions: response.data.allowed_actions,
        selected_actions_url: response.data.selected_actions_url,
      };
    } catch (error) {
      this.handleError(error, 'Failed to get GitHub Actions permissions');
    }
  }

  public async setActionsPermissions(permissions: GitHubActionsPermissions): Promise<void> {
    this.ensureInitialized();

    if (!this.octokit) {
      throw new Error('GitHub token not available');
    }

    try {
      await this.octokit.rest.actions.setGithubActionsPermissionsRepository({
        owner: this.owner,
        repo: this.repo,
        enabled: permissions.enabled,
        allowed_actions: permissions.allowed_actions as 'all' | 'local_only' | 'selected' | undefined,
      });

      this.logger.debug(`GitHub Actions permissions updated: enabled=${permissions.enabled}`);
    } catch (error) {
      this.handleError(error, 'Failed to set GitHub Actions permissions');
    }
  }

  // Method to check if Actions are currently enabled
  public async areActionsEnabled(): Promise<boolean> {
    try {
      const permissions = await this.getActionsPermissions();
      return permissions.enabled;
    } catch (error) {
      this.logger.warn(`Could not check Actions status: ${String(error)}`);
      return true; // Assume enabled if we can't check
    }
  }

  // Method to get repository information
  public async getRepositoryInfo(): Promise<any> {
    this.ensureInitialized();

    if (!this.octokit) {
      throw new Error('GitHub token not available');
    }

    try {
      const response = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo,
      });

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get repository information');
    }
  }

  public async getRepositoryActivationDetails(): Promise<RepositoryActivationDetails> {
    this.ensureInitialized();
    const config = this.configService.getConfig();
    if (!this.octokit) {
      throw new Error('GitHub token not available to get repository details');
    }

    try {
      this.logger.info('Fetching repository details for activation...');

      const repoInfo = await this.getRepositoryInfo();
      const uniqueId = repoInfo.id.toString();

      const getOperatingSystem = (): 'Linux' | 'Windows' | 'MacOS' => {
        const runnerOS = process.env.RUNNER_OS || 'Linux';
        switch (runnerOS) {
          case 'Linux': return 'Linux';
          case 'Windows': return 'Windows';
          case 'macOS': return 'MacOS';
          default:
            this.logger.warn(`Unexpected operating system: ‘${runnerOS}’. ‘Linux’ is assumed.`);
            return 'Linux';
        }
      };

      const details: RepositoryActivationDetails = {
        uniqueId: uniqueId,
        ip: process.env.RUNNER_IP || '127.0.0.1', 
        operatingSystem: getOperatingSystem(),
        endpointType: config.endpoint.endpointType,
        endpointName: this.repo,
      };

      this.logger.info('Successfully fetched repository activation details.');
      return details;

    } catch (error) {
      this.handleError(error, 'Failed to get repository activation details');
    }
  }

}