import { BaseService } from '../base/base-service';
import { ICryptoService, ILogger } from '../base/interfaces';
export declare class CryptoService extends BaseService implements ICryptoService {
    constructor(logger: ILogger);
    protected onInitialize(): Promise<void>;
    hashPassword(password: string): string;
    encrypt(inputBuffer: Buffer, password: string): Promise<Buffer>;
    decrypt(encryptedBuffer: Buffer, password: string): Promise<Buffer>;
    decryptBackup(encryptedBuffer: Buffer, password: string): Promise<Buffer>;
    encryptArchive(filePath: string, password: string): Promise<Buffer>;
    getEncryptedFileName(password: string): string;
}
//# sourceMappingURL=crypto.service.d.ts.map