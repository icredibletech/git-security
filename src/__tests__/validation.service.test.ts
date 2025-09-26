import { ValidationService } from '../services/validation/validation.service';
import { ConsoleLogger } from '../utils/logger';

describe('ValidationService', () => {
  let validationService: ValidationService;
  let logger: ConsoleLogger;

  beforeEach(async () => {
    logger = new ConsoleLogger();
    validationService = new ValidationService(logger);
    await validationService.initialize();
  });

  describe('validatePassword', () => {
    it('should accept a valid password', () => {
      expect(() => {
        validationService.validatePassword('MyPassword123!');
      }).not.toThrow();
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(() => {
        validationService.validatePassword('Short1!');
      }).toThrow('Encryption password must be at least 8 characters');
    });

    it('should reject passwords without uppercase letters', () => {
      expect(() => {
        validationService.validatePassword('mypassword123!');
      }).toThrow(
        'Encryption password must contain at least one uppercase letter'
      );
    });

    it('should reject passwords without lowercase letters', () => {
      expect(() => {
        validationService.validatePassword('MYPASSWORD123!');
      }).toThrow(
        'Encryption password must contain at least one lowercase letter'
      );
    });

    it('should reject passwords without digits', () => {
      expect(() => {
        validationService.validatePassword('MyPassword!');
      }).toThrow('Encryption password must contain at least one digit');
    });

    it('should reject passwords without special characters', () => {
      expect(() => {
        validationService.validatePassword('MyPassword123');
      }).toThrow(
        'Encryption password must contain at least one special character'
      );
    });

    it('should reject passwords with forbidden characters', () => {
      expect(() => {
        validationService.validatePassword('MyPassword123!🚀');
      }).toThrow(
        'Encryption password can only contain alphanumeric characters'
      );
    });

    it('should reject empty passwords', () => {
      expect(() => {
        validationService.validatePassword('');
      }).toThrow('Encryption password is required');
    });
  });

  describe('validateActionType', () => {
    it('should accept backup action', () => {
      expect(() => {
        validationService.validateActionType('backup');
      }).not.toThrow();
    });

    it('should accept restore action', () => {
      expect(() => {
        validationService.validateActionType('restore');
      }).not.toThrow();
    });

    it('should reject invalid action types', () => {
      expect(() => {
        validationService.validateActionType('invalid');
      }).toThrow("Invalid action type. Must be 'backup' or 'restore'");
    });

    it('should reject empty action type', () => {
      expect(() => {
        validationService.validateActionType('');
      }).toThrow('Action type is required');
    });
  });

  describe('validateOtpMethod', () => {
    it('should accept MAIL method', () => {
      expect(() => {
        validationService.validateOtpMethod('MAIL');
      }).not.toThrow();
    });

    it('should accept AUTHENTICATOR method', () => {
      expect(() => {
        validationService.validateOtpMethod('AUTHENTICATOR');
      }).not.toThrow();
    });

    it('should reject invalid OTP methods', () => {
      expect(() => {
        validationService.validateOtpMethod('INVALID');
      }).toThrow(
        "Invalid otp_delivery_method. Must be 'MAIL' or 'AUTHENTICATOR'"
      );
    });
  });

  describe('validateRestoreInputs', () => {
    it('should accept valid restore inputs', () => {
      expect(() => {
        validationService.validateRestoreInputs('file-123', true);
      }).not.toThrow();

      expect(() => {
        validationService.validateRestoreInputs('file-456', false);
      }).not.toThrow();
    });

    it('should reject missing file version ID', () => {
      expect(() => {
        validationService.validateRestoreInputs('', true);
      }).toThrow(
        "Input 'file_version_id' is required when action is 'restore'"
      );

      expect(() => {
        validationService.validateRestoreInputs(undefined, true);
      }).toThrow(
        "Input 'file_version_id' is required when action is 'restore'"
      );
    });

    it('should reject missing suspend actions', () => {
      expect(() => {
        validationService.validateRestoreInputs('file-123', undefined);
      }).toThrow(
        "Input 'suspend_actions' is required when action is 'restore'"
      );
    });

    it('should reject invalid suspend actions type', () => {
      expect(() => {
        validationService.validateRestoreInputs('file-123', 'true' as any);
      }).toThrow("Invalid suspend_actions. Must be 'true' or 'false'");
    });
  });
});
