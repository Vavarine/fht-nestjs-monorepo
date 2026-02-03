export abstract class FileManager {
  abstract save(data: Buffer, filename: string): Promise<string>;
  abstract deleteByFileName(filename: string): Promise<void>;
  abstract fileExists(filename: string): Promise<boolean>;
  abstract getFileUrl(filename: string, host: string, port: string): Promise<string>;
}