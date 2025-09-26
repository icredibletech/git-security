import { ILogger } from '@/services/base/interfaces';
export declare class GitHubActionsLogger implements ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: Error): void;
    notice(message: string): void;
    debug(message: string): void;
    setSecret(secret: string): void;
}
export declare class ConsoleLogger implements ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: Error): void;
    notice(message: string): void;
    debug(message: string): void;
    setSecret(secret: string): void;
}
//# sourceMappingURL=logger.d.ts.map