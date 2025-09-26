import { CryptoService } from '../services/crypto/crypto.service';
import { ConsoleLogger } from '../utils/logger';

describe('CryptoService', () => {
  let cryptoService: CryptoService;
  let logger: ConsoleLogger;

  beforeEach(async () => {
    logger = new ConsoleLogger();
    cryptoService = new CryptoService(logger);
    await cryptoService.initialize();
  });

  describe('hashPassword', () => {
    it('should hash passwords consistently', () => {
      const password = 'MyTestPassword123!';
      const hash1 = cryptoService.hashPassword(password);
      const hash2 = cryptoService.hashPassword(password);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different passwords', () => {
      const password1 = 'Password1!';
      const password2 = 'Password2!';

      const hash1 = cryptoService.hashPassword(password1);
      const hash2 = cryptoService.hashPassword(password2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('encrypt and decrypt', () => {
    const testData = Buffer.from('This is a test string for encryption');
    const password = 'SecurePassword123!';

    it('should encrypt and decrypt data successfully', async () => {
      const encrypted = await cryptoService.encrypt(testData, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);

      expect(decrypted).toEqual(testData);
    });

    it('should produce different encrypted data for the same input', async () => {
      // Due to random salt and IV, encryption should produce different results
      const encrypted1 = await cryptoService.encrypt(testData, password);
      const encrypted2 = await cryptoService.encrypt(testData, password);

      expect(encrypted1).not.toEqual(encrypted2);
    });

    it('should fail to decrypt with wrong password', async () => {
      const encrypted = await cryptoService.encrypt(testData, password);

      await expect(
        cryptoService.decrypt(encrypted, 'WrongPassword123!')
      ).rejects.toThrow();
    });

    it('should handle empty data', async () => {
      const emptyData = Buffer.alloc(0);
      const encrypted = await cryptoService.encrypt(emptyData, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);

      expect(decrypted).toEqual(emptyData);
    });

    it('should encrypt data with proper header format', async () => {
      const encrypted = await cryptoService.encrypt(testData, password);

      // Should start with "Salted__" header (OpenSSL compatible)
      const header = encrypted.subarray(0, 8).toString();
      expect(header).toBe('Salted__');

      // Should have minimum length (header + salt + encrypted data)
      expect(encrypted.length).toBeGreaterThan(16); // 8 (header) + 8 (salt) + data
    });
  });

  describe('error handling', () => {
    it('should handle invalid encrypted data format', async () => {
      const invalidData = Buffer.from('This is not encrypted data');

      await expect(
        cryptoService.decrypt(invalidData, 'password')
      ).rejects.toThrow('Invalid initialization vector');
    });

    it('should handle corrupted encrypted data', async () => {
      const testData = Buffer.from('Test data');
      const encrypted = await cryptoService.encrypt(testData, 'password');

      // Corrupt the encrypted data
      encrypted[encrypted.length - 1] = encrypted[encrypted.length - 1] ^ 0xff;

      await expect(
        cryptoService.decrypt(encrypted, 'password')
      ).rejects.toThrow();
    });
  });
});
