import { IService, ILogger } from './interfaces';
export declare abstract class BaseService implements IService {
    protected logger: ILogger;
    protected initialized: boolean;
    constructor(logger: ILogger);
    initialize(): Promise<void>;
    protected abstract onInitialize(): Promise<void>;
    protected ensureInitialized(): void;
    protected handleError(error: unknown, context: string): never;
    protected safeExecute<T>(operation: () => Promise<T>, context: string, fallback?: T): Promise<T>;
}
//# sourceMappingURL=base-service.d.ts.map