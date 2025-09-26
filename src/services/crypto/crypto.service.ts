import { createHash, pbkdf2, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';
import { BaseService } from '../base/base-service';
import { ICryptoService, ILogger } from '../base/interfaces';
import { promises as fs } from 'fs';


const pbkdf2Async = promisify(pbkdf2);

export class CryptoService extends BaseService implements ICryptoService {

  constructor(logger: ILogger) {
    super(logger);
  }

  protected async onInitialize(): Promise<void> {
    try {
      const testHash = createHash('sha256');
      testHash.update('test');
      testHash.digest('hex');
    } catch (error) {
      throw new Error('Crypto functionality not available');
    }
  }

  public hashPassword(password: string): string {
    this.ensureInitialized();
    
    try {
      const hash = createHash('sha256');
      hash.update(password, 'utf8');
      return hash.digest('hex');
    } catch (error) {
      this.handleError(error, 'Failed to hash password');
    }
  }

  public async encrypt(inputBuffer: Buffer, password: string): Promise<Buffer> {
    this.ensureInitialized();
    try {
      const saltLength = 8;
      const ivLength = 16;
      const keyLength = 32;
      const iterations = 100000;
      const algorithm = 'aes-256-cbc';
      const digest = 'sha256';

      const salt = randomBytes(saltLength);
      const key = await pbkdf2Async(password, salt, iterations, keyLength, digest);
      const iv = randomBytes(ivLength);
      const cipher = createCipheriv(algorithm, key, iv);
      const encryptedData = Buffer.concat([cipher.update(inputBuffer), cipher.final()]);
      
     
      return Buffer.concat([Buffer.from('Salted__'), salt, iv, encryptedData]);
    } catch (error) {
      this.handleError(error, 'Failed to encrypt data');
    }
  }


  public async decrypt(encryptedBuffer: Buffer, password: string): Promise<Buffer> {
    this.ensureInitialized();
    try {
      const saltLength = 8;
      const ivLength = 16;
      const keyLength = 32;
      const iterations = 100000;
      const algorithm = 'aes-256-cbc';
      const digest = 'sha256';

      const salt = encryptedBuffer.subarray(8, 8 + saltLength);
      const iv = encryptedBuffer.subarray(8 + saltLength, 8 + saltLength + ivLength);
      const encryptedData = encryptedBuffer.subarray(8 + saltLength + ivLength);

      const key = await pbkdf2Async(password, salt, iterations, keyLength, digest);

      const decipher = createDecipheriv(algorithm, key, iv);

      const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      return decryptedData;
    } catch (error) {
      this.handleError(error, 'Failed to decrypt data');
    }
  }
    public async decryptBackup(encryptedBuffer: Buffer, password: string): Promise<Buffer> {
    const hashedPassword = this.hashPassword(password);
    return await this.decrypt(encryptedBuffer, hashedPassword);
  }

    public async encryptArchive(filePath: string, password: string): Promise<Buffer> {
      const fileBuffer = await fs.readFile(filePath);
      const hashedPassword = this.hashPassword(password);
      return await this.encrypt(fileBuffer, hashedPassword);
    }
  
    public getEncryptedFileName(password: string): string {
      const repoName = process.env.GITHUB_REPOSITORY?.split('/').pop() || 'repository';
      return `${repoName}.tar.zst.enc`;
    }
}