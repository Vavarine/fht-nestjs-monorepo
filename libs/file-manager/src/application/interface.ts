export abstract class FileManager {
  abstract save(data: Buffer, fileId: string): Promise<string>;
  abstract deleteById(fileId: string): Promise<void>;
  abstract fileExists(fileId: string): Promise<boolean>;
  abstract getFileUrl(fileId: string, baseUrl: string): Promise<string>;
  abstract getPublicFileUrl(fileId: string): Promise<string>;
  abstract getFile(fileId: string): Promise<Buffer | null>;
}
