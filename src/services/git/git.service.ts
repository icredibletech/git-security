import * as core from '@actions/core';
import { context } from '@actions/github';
import { exec } from '@actions/exec';
import { BaseService } from '../base/base-service';
import { IGitService, ILogger } from '../base/interfaces';
import { CommitInfo } from '@/types/github';

export class GitService extends BaseService implements IGitService {
    private isFilterRepoAvailable: boolean = false;


  constructor(logger: ILogger) {
    super(logger);
  }

  protected async onInitialize(): Promise<void> {
    // Verify git is available
    try {
      await exec('git', ['--version'], { silent: true });
      if(core.getInput('action', { required: true }) == "restore"){
        await this.setupGitFilterRepo();
      }
    } catch (error) {
      throw new Error('Git is not available in the environment');
    }
  }

  public async createMirrorClone(sourceDir: string, targetDir: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.logger.info(`Creating mirror clone from ${sourceDir} to ${targetDir}`);
      
      await exec('git', ['clone', '--mirror', sourceDir, targetDir]);
      
      this.logger.info('Mirror clone created successfully');
    } catch (error) {
      this.handleError(error, 'Failed to create mirror clone');
    }
  }

  public async getCurrentCommitInfo(): Promise<CommitInfo> {
    this.ensureInitialized();

    try {
      let output = '';
      let errorOutput = '';

      // Check if we have any commits
      const exitCode = await exec('git', ['rev-parse', '--verify', 'HEAD'], {
        silent: true,
        ignoreReturnCode: true,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
          stderr: (data: Buffer) => {
            errorOutput += data.toString();
          },
        },
      });

      if (exitCode !== 0) {
        this.logger.warn('No commits found in repository');
        return {
          hash: '',
          shortHash: '',
          author: '',
          date: '',
          message: '',
          parents: '',
        };
      }

      // Get detailed commit information
      output = '';
      await exec('git', ['log', '-1', '--pretty=%H|%h|%P|%an <%ae>|%ad|%cn|%s%n%b'], {
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
        },
      });

      const lines = output.trim().split('\n');
      const commitLine = lines[0];
      const messageLine = lines.slice(1).join('\n').trim();

      const [hash, shortHash, parents, author, date, committer, subject] = commitLine.split('|');

      const commitInfo: CommitInfo = {
        hash: hash || '',
        shortHash: shortHash || '',
        author: author || '',
        date: date || '',
        message: subject ? `${subject}${messageLine ? `\n${messageLine}` : ''}` : '',
        parents: parents || '',
      };

      this.logger.debug(`Retrieved commit info: ${commitInfo.shortHash}`);
      return commitInfo;
    } catch (error) {
      this.handleError(error, 'Failed to get current commit info');
    }
  }

  public async configureGit(userName: string, userEmail: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.logger.info(`Configuring git user: ${userName} <${userEmail}>`);
      
      await exec('git', ['config', 'user.name', userName]);
      await exec('git', ['config', 'user.email', userEmail]);
      
      this.logger.info('Git user configuration completed');
    } catch (error) {
      this.handleError(error, 'Failed to configure git user');
    }
  }

  public async setRemoteUrl(repoPath: string, remoteUrl: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.logger.info(`Setting remote URL to: ${remoteUrl.replace(/:[^:@]*@/, ':***@')}`);
      
      await exec('git', ['remote', 'set-url', 'origin', remoteUrl], { cwd: repoPath });
      
      this.logger.info('Remote URL updated successfully');
    } catch (error) {
      this.handleError(error, 'Failed to set remote URL');
    }
  }

  public async pushMirror(repoPath: string, remoteUrl: string): Promise<void> {
    this.ensureInitialized();
    try {
      this.logger.info('Pushing mirror to remote repository (used for default token)');
      
      await exec('git', ['push', '--mirror', '--force', remoteUrl], { cwd: repoPath });
      this.logger.warn('The repository will be restored without the ./.github/workflow directory. If you want to restore this directory, you can find the relevant steps at the following link: https://github.com/marketplace/actions/icredible-git-security#-personal-access-token-pat-setup-guide-for-repository-restore');
    } catch (error) {
      this.handleError(error, 'Failed to push mirror');
    }
  }

public async pushAllBranches(repoPath: string, remoteUrl: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.logger.info('Pushing all branches and tags individually to remote repository (used for PAT token)');

      let branchOutput = '';
      await exec('git', ['for-each-ref', '--format=%(refname:short)', 'refs/heads/'], {
        cwd: repoPath,
        listeners: { stdout: (data: Buffer) => { branchOutput += data.toString(); } },
      });
      const branches = branchOutput.split('\n').filter(b => b);

      for (const branch of branches) {
        this.logger.info(`Pushing branch: ${branch}`);
        await exec('git', ['push', remoteUrl, branch, '--force'], { cwd: repoPath });
      }
      
      this.logger.info('Pushing all tags...');
      await exec('git', ['push', remoteUrl, '--tags', '--force'], { cwd: repoPath });
      
      this.logger.info('All branches and tags pushed successfully');
    } catch (error) {
      this.handleError(error, 'Failed to push all branches and tags');
    }
  }

  public async syncRemoteBranches(repoPath: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.logger.info('Syncing remote branches as local branches');
      
      let output = '';
      await exec('git', ['branch', '-r'], {
        cwd: repoPath,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
        },
      });

      const remoteBranches = output
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.includes('->')) // Skip HEAD symbolic refs
        .map(line => line.replace(/^origin\//, '')); // Remove origin/ prefix

      for (const branch of remoteBranches) {
        if (branch === 'HEAD') continue;
        
        try {
          this.logger.debug(`Creating local branch: ${branch}`);
          await exec('git', ['branch', branch, `origin/${branch}`], { 
            cwd: repoPath,
            ignoreReturnCode: true, // Branch might already exist
          });
        } catch (error) {
          this.logger.warn(`Could not create local branch ${branch}: ${String(error)}`);
        }
      }
      
      this.logger.info('Remote branch sync completed');
    } catch (error) {
      this.handleError(error, 'Failed to sync remote branches');
    }
  }

  private async setupGitFilterRepo(): Promise<void> {
    try {
      this.logger.info('Checking for Python and attempting to install git-filter-repo via pip...');
      
      await exec('python3', ['--version'], { silent: true });
      await exec('pip3', ['--version'], { silent: true });

      await exec('pip3', ['install', 'git-filter-repo']);
      
      this.isFilterRepoAvailable = true;
      this.logger.info('git-filter-repo installed successfully and is ready to use.');
    } catch (error) {
      this.logger.warn(`Could not install git-filter-repo via pip: ${String(error)}. Falling back to git-filter-branch.`);
      this.isFilterRepoAvailable = false;
    }
  }

  public async filterWorkflowDirectory(repoPath: string): Promise<void> {
    this.ensureInitialized();

    if (this.isFilterRepoAvailable) {
      try {
        this.logger.info('Filtering out .github/workflows directory using git-filter-repo...');
        await exec('git', [
          'filter-repo',
          '--force',
          '--path',
          '.github/workflows',
          '--invert-paths',
        ], {
          cwd: repoPath
        });
        
        this.logger.info('Workflow directory filtering completed with git-filter-repo.');
        return; 
      } catch (error) {
        this.logger.warn(`git-filter-repo failed: ${String(error)}. Falling back to git-filter-branch.`);
      }
    }

    this.logger.info('Filtering out .github/workflows directory using git-filter-branch (fallback)...');
    try {
      const command = 'git rm -rf --cached --ignore-unmatch .github/workflows';
      const env = { ...process.env, FILTER_BRANCH_SQUELCH_WARNING: '1' };

      await exec('git', [
        'filter-branch', '--force', '--index-filter', command,
        '--prune-empty', '--tag-name-filter', 'cat', '--', '--all'
      ], { 
        cwd: repoPath,
        env: env
      });
      
      this.logger.info('Workflow directory filtering completed with git-filter-branch.');
    } catch (error) {
      this.handleError(error, 'Failed to filter workflow directory from repository history. This is a critical step.');
    }
  }

  // Utility method to check if repository has commits
  public async hasCommits(repoPath?: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      const exitCode = await exec('git', ['rev-parse', '--verify', 'HEAD'], {
        cwd: repoPath,
        silent: true,
        ignoreReturnCode: true,
      });
      
      return exitCode === 0;
    } catch (error) {
      return false;
    }
  }

  // Utility method to get current branch name
  public async getCurrentBranch(repoPath?: string): Promise<string> {
    this.ensureInitialized();

    try {
      let output = '';
      await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
        cwd: repoPath,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
        },
      });

      return output.trim();
    } catch (error) {
      this.handleError(error, 'Failed to get current branch');
    }
  }

   public async configureAndPush(config: any, hasPatToken: boolean): Promise<void> {
      const repoPath = config.files.sourceArchiveDir;
      
      await this.configureGit(config.git.userName, config.git.userEmail);
      
      const token = hasPatToken 
        ? config.inputs.icredible_repository_restore_token 
        : core.getInput('github-token', { required: true });
      
      if (!token) {
        throw new Error('No GitHub token available for pushing');
      }
  
      // Build authenticated remote URL
      const remoteUrl = `https://x-access-token:${token}@github.com/${context.repo.owner}/${context.repo.repo}.git`;
      
      // // Set remote URL
      // await this.gitService.setRemoteUrl(repoPath, remoteUrl);
      
      // Push based on token type
      if (hasPatToken) {
        // PAT token can use mirror push
      await this.pushAllBranches(repoPath, remoteUrl);
  
      } else {
        // Default token push all branches individually
        await this.pushMirror(repoPath, remoteUrl);
      }
    }
}