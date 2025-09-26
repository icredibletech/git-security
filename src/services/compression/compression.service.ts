import { createReadStream, createWriteStream, promises as fs, Stats } from 'fs';
import { join } from 'path';
import * as tar from 'tar';
import { pipeline } from 'stream/promises';
import { BaseService } from '../base/base-service';
import { ICompressionService, ILogger } from '../base/interfaces';
import { exec } from '@actions/exec';

export class CompressionService extends BaseService implements ICompressionService {
  constructor(logger: ILogger) {
    super(logger);
  }

  protected async onInitialize(): Promise<void> {
    try {
      if (typeof tar.create !== 'function') {
        throw new Error('Tar create function not available');
      }
    } catch (error) {
      throw new Error('Tar functionality not available');
    }
  }

  public async createTarArchive(sourceDir: string, outputPath: string): Promise<number> {
    this.ensureInitialized();

    try {
      this.logger.info(`Creating tar archive from ${sourceDir} to ${outputPath}`);
      
      // Verify source directory exists
      const sourceStat = await fs.stat(sourceDir);
      if (!sourceStat.isDirectory()) {
        throw new Error(`Source path ${sourceDir} is not a directory`);
      }

      // Create tar archive
      await tar.create(
        {
          file: outputPath,
          cwd: process.cwd(),
          gzip: false,
          portable: true,
        },
        [sourceDir]
      );

      // Get file size
      const stat = await fs.stat(outputPath);
      const fileSize = stat.size;
      
      this.logger.info(`Tar archive created successfully. Size: ${fileSize} bytes`);
      return fileSize;
    } catch (error) {
      this.handleError(error, 'Failed to create tar archive');
    }
  }

    public async compressWithZstd(inputPath: string, outputPath: string): Promise<number> {
    this.ensureInitialized();
    try {
      this.logger.info(`Compressing ${inputPath} with zstd to ${outputPath}`);
      
      // Düzeltilmiş loader fonksiyonu artık doğru nesneyi döndürecek
      const zstdSimple = await this.loadZstdModule();
      
      const inputBuffer = await fs.readFile(inputPath);
      
      const compressedBuffer = zstdSimple.compress(inputBuffer, 10);
      
      await fs.writeFile(outputPath, compressedBuffer);
      
      const compressedSize = compressedBuffer.length;
      this.logger.info(`Zstd compression completed. Compressed size: ${compressedSize} bytes`);
      
      return compressedSize;
    } catch (error) {
      this.handleError(error, 'Failed to compress with zstd');
    }
  }

  public async decompressZstd(inputPath: string, outputPath: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.logger.info(`Decompressing ${inputPath} with zstd to ${outputPath}`);
      
      const zstd = await this.loadZstdModule();
      
      // Read compressed file
      const compressedBuffer = await fs.readFile(inputPath);
      
      // Decompress
      const decompressedBuffer = zstd.decompress(compressedBuffer);
      
      // Write decompressed file
      await fs.writeFile(outputPath, decompressedBuffer);
      
      this.logger.info(`Zstd decompression completed`);
    } catch (error) {
      this.handleError(error, 'Failed to decompress with zstd');
    }
  }

  public async extractTarArchive(tarPath: string, extractDir: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.logger.info(`Extracting tar archive ${tarPath} to ${extractDir}`);
      
      // Ensure extract directory exists
      await fs.mkdir(extractDir, { recursive: true });
      
      // Extract tar archive
      await tar.extract({
        file: tarPath,
        cwd: extractDir,
        strip: 0,
      });
      
      this.logger.info(`Tar archive extracted successfully`);
    } catch (error) {
      this.handleError(error, 'Failed to extract tar archive');
    }
  }

  // Stream-based compression for large files to avoid memory issues
  public async compressStreamWithZstd(inputPath: string, outputPath: string): Promise<number> {
    this.ensureInitialized();

    try {
      this.logger.info(`Stream compressing ${inputPath} with zstd to ${outputPath}`);
      
      // For very large files, we might need to implement streaming compression
      // For now, fall back to buffer-based compression
      return await this.compressWithZstd(inputPath, outputPath);
    } catch (error) {
      this.handleError(error, 'Failed to stream compress with zstd');
    }
  }

  // Utility method to get directory size
  public async getDirectorySize(dirPath: string): Promise<number> {
    this.ensureInitialized();

    try {
      const stat = await fs.stat(dirPath);
      if (stat.isFile()) {
        return stat.size;
      }
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(dirPath);
        let totalSize = 0;
        
        for (const file of files) {
          const filePath = join(dirPath, file);
          totalSize += await this.getDirectorySize(filePath);
        }
        
        return totalSize;
      }
      
      return 0;
    } catch (error) {
      this.logger.warn(`Could not get size for ${dirPath}: ${String(error)}`);
      return 0;
    }
  }

  private async loadZstdModule(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // require('zstd-codec') dinamik olarak ZstdCodec'i getirir
        const { ZstdCodec } = require('zstd-codec');
        
        // Kütüphanenin asenkron başlatmasını yönet
        ZstdCodec.run((zstd: { Simple: new () => any; }) => {
          const simple = new zstd.Simple();
          // Promise'i 'simple' nesnesi ile başarıyla tamamla
          resolve(simple);
        });
      } catch (error) {
        // Hata durumunda Promise'i reddet
        reject(new Error('zstd-codec module not available. Please install it with: npm install zstd-codec'));
      }
    });
  }
}