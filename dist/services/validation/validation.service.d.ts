import { BaseService } from '../base/base-service';
import { IValidationService, ILogger } from '../base/interfaces';
export declare class ValidationService extends BaseService implements IValidationService {
    constructor(logger: ILogger);
    protected onInitialize(): Promise<void>;
    validatePassword(password: string): void;
    validateActionType(action: string): void;
    validateOtpMethod(method: string): void;
    validateRestoreInputs(fileVersionId?: string, suspendActions?: boolean): void;
}
//# sourceMappingURL=validation.service.d.ts.map