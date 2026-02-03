import { FileManager } from "@file-manager/application/interface";
import { Injectable } from "@nestjs/common";
import { generateRandomFileName } from "@file-manager/utils/generate-random-file-name";

@Injectable()
export class DiskFileManager implements FileManager {
  private fs = require('fs');
  private path = require('path');
  private basePath = this.path.join(process.cwd(), process.env.UPLOADS_PATH || 'uploads');

  constructor() { }

  async save(fileBuffer: Buffer, originalFileName: string): Promise<string> {
    const newFileName = generateRandomFileName(originalFileName)

    const filePath = this.path.join(this.basePath, newFileName);
    await this.fs.promises.writeFile(filePath, fileBuffer);

    return newFileName;
  }

  async fileExists(filename: string): Promise<boolean> {
    const filePath = this.path.join(this.basePath, filename);

    try {
      await this.fs.promises.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteByFileName(filename: string): Promise<void> {
    const filePath = this.path.join(this.basePath, filename);
    await this.fs.promises.unlink(filePath);
  }

  async getFileUrl(filename: string, host: string, port: string): Promise<string> {
    const fileUrl = `${host}:${port}/uploads/${filename}`;

    return fileUrl;
  }
}
