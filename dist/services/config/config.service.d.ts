import { BaseService } from '../base/base-service';
import { IConfigService, IValidationService, ILogger } from '../base/interfaces';
import { ActionInputs, AppConfig } from '@/types/config';
export declare class ConfigService extends BaseService implements IConfigService {
    private config;
    private validationService;
    constructor(logger: ILogger, validationService: IValidationService);
    protected onInitialize(): Promise<void>;
    validateInputs(inputs: ActionInputs): Promise<void>;
    getConfig(): AppConfig;
    getApiConfig(): AppConfig['api'];
    getCryptoConfig(): AppConfig['crypto'];
    getEnpointConfig(): AppConfig['endpoint'];
    getFileConfig(): AppConfig['files'];
    private buildConfig;
    private getInputsFromEnvironment;
}
//# sourceMappingURL=config.service.d.ts.map