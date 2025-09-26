import { BaseService } from '../base/base-service';
import { IValidationService, ILogger } from '../base/interfaces';

export class ValidationService extends BaseService implements IValidationService {
  constructor(logger: ILogger) {
    super(logger);
  }

  protected async onInitialize(): Promise<void> {
    // No async initialization needed for validation service
  }

  public validatePassword(password: string): void {
    this.ensureInitialized();

    if (!password) {
      throw new Error('Encryption password is required');
    }

    if (password.length < 8) {
      throw new Error(`Encryption password must be at least 8 characters (got ${password.length})`);
    }

    // Check for forbidden characters
    const allowedPattern = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/;
    if (!allowedPattern.test(password)) {
      throw new Error(
        'Encryption password can only contain alphanumeric characters and the following special characters: !@#$%^&*(),.?":{}|<>. ' +
        'Emojis, unicode characters, and other symbols are not allowed.'
      );
    }

    // Check for required character types
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
      throw new Error('Encryption password must contain at least one uppercase letter');
    }

    if (!hasLowercase) {
      throw new Error('Encryption password must contain at least one lowercase letter');
    }

    if (!hasDigit) {
      throw new Error('Encryption password must contain at least one digit');
    }

    if (!hasSpecialChar) {
      throw new Error('Encryption password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    }
  }

  public validateActionType(action: string): void {
    this.ensureInitialized();

    if (!action) {
      throw new Error('Action type is required');
    }

    if (action !== 'backup' && action !== 'restore') {
      throw new Error("Invalid action type. Must be 'backup' or 'restore'");
    }
  }

  public validateOtpMethod(method: string): void {
    this.ensureInitialized();

    if (!method) {
      throw new Error('OTP delivery method is required');
    }

    if (method !== 'MAIL' && method !== 'AUTHENTICATOR') {
      throw new Error("Invalid otp_delivery_method. Must be 'MAIL' or 'AUTHENTICATOR'");
    }
  }

  public validateRestoreInputs(fileVersionId?: string, suspendActions?: boolean): void {
    this.ensureInitialized();

    if (!fileVersionId) {
      throw new Error("Input 'file_version_id' is required when action is 'restore'");
    }

    if (suspendActions === undefined) {
      throw new Error("Input 'suspend_actions' is required when action is 'restore'");
    }

    if (typeof suspendActions !== 'boolean') {
      throw new Error("Invalid suspend_actions. Must be 'true' or 'false'");
    }
  }
}