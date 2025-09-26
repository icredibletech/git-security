import { FileUploadData } from '@/types/api';
import { CommitInfo } from '@/types/github';
import { AppConfig } from '@/types/config';
export declare class DataMapper {
    static createUploadData(encryptedBuffer: Buffer, fileName: string, originalSize: number, encryptedSize: number, commitInfo: CommitInfo, config: AppConfig): FileUploadData;
}
//# sourceMappingURL=data.mapper.d.ts.map