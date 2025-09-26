import { BaseService } from '../base/base-service';
import { ICompressionService, ILogger } from '../base/interfaces';
export declare class CompressionService extends BaseService implements ICompressionService {
    constructor(logger: ILogger);
    protected onInitialize(): Promise<void>;
    createTarArchive(sourceDir: string, outputPath: string): Promise<number>;
    compressWithZstd(inputPath: string, outputPath: string): Promise<number>;
    decompressZstd(inputPath: string, outputPath: string): Promise<void>;
    extractTarArchive(tarPath: string, extractDir: string): Promise<void>;
    compressStreamWithZstd(inputPath: string, outputPath: string): Promise<number>;
    getDirectorySize(dirPath: string): Promise<number>;
    private loadZstdModule;
}
//# sourceMappingURL=compression.service.d.ts.map