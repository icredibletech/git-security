import { IService, ILogger } from './interfaces';

export abstract class BaseService implements IService {
  protected logger: ILogger;
  protected initialized: boolean = false;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.onInitialize();
    this.initialized = true;
  }

  protected abstract onInitialize(): Promise<void>;

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} must be initialized before use`);
    }
  }

  protected handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${context}: ${errorMessage}`;
    
    this.logger.error(fullMessage, error instanceof Error ? error : new Error(errorMessage));
    throw new Error(fullMessage);
  }

  protected async safeExecute<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (fallback !== undefined) {
        this.logger.warn(`${context} failed, using fallback: ${String(error)}`);
        return fallback;
      }
      this.handleError(error, context);
    }
  }
}