// utils/backup.ts
import { context } from '@actions/github';
import { FileUploadData, BackupMetadata } from '@/types/api';
import { CommitInfo } from '@/types/github';
import { AppConfig } from '@/types/config';

export class DataMapper {
  static createUploadData(
    encryptedBuffer: Buffer,
    fileName: string,
    originalSize: number,
    encryptedSize: number,
    commitInfo: CommitInfo,
    config: AppConfig
  ): FileUploadData {
    const metadata: BackupMetadata = {
      event: context.eventName,
      ref: context.ref,
      actor: context.actor,
      owner: context.repo.owner,
      ownerType: process.env.OWNER_TYPE || 'User',
      commit: commitInfo.hash,
      commitShort: commitInfo.shortHash,
      parents: commitInfo.parents,
      author: commitInfo.author,
      date: commitInfo.date,
      committer: commitInfo.author, // Using author as committer for simplicity
      message: commitInfo.message,
    };

    return {
      file: encryptedBuffer,
      size: originalSize,
      compressedFileSize: encryptedSize,
      attributes: config.upload.attributes,
      fileName: `${fileName}`,
      fullPath: `/${context.repo.owner}/${context.repo.repo}/${fileName}`,
      compressionEngine: config.upload.compressionEngine,
      compressionLevel: config.upload.compressionLevel,
      encryptionType: config.upload.encryptionType,
      revisionType: config.upload.revisionType,
      metadata,
    };
  }
}
