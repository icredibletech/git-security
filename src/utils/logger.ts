import * as core from '@actions/core';
import { ILogger } from '@/services/base/interfaces';

export class GitHubActionsLogger implements ILogger {
  info(message: string): void {
    core.info(message);
  }

  warn(message: string): void {
    core.warning(message);
  }

  error(message: string, error?: Error): void {
    core.error(message);
    if (error) {
      core.debug(`Error stack: ${error.stack || 'No stack trace available'}`);
    }
  }

  notice(message: string): void {
    core.notice(message);
  }

  debug(message: string): void {
    core.debug(message);
  }

  setSecret(secret: string): void {
    core.setSecret(secret);
  }
}

export class ConsoleLogger implements ILogger {
  info(message: string): void {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`);
  }

  warn(message: string): void {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`);
  }

  error(message: string, error?: Error): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`);
    if (error) {
      // eslint-disable-next-line no-console
      console.error(
        `[ERROR] Stack: ${error.stack || 'No stack trace available'}`
      );
    }
  }

  notice(message: string): void {
    // eslint-disable-next-line no-console
    console.log(`[NOTICE] ${message}`);
  }

  debug(message: string): void {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] ${message}`);
  }

  setSecret(secret: string): void {
    // For console logger, we don't actually mask secrets, just log that one was set
    this.debug(`Secret set (length: ${secret.length})`);
  }
}
