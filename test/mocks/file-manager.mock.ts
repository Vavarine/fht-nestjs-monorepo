export class FileManagerMock {
  public savedFiles: Map<string, Buffer | any> = new Map();

  async save(buffer: Buffer | any, originalFileName: string): Promise<string> {
    const fileName = `mocked-${Date.now()}-${originalFileName}`;
    this.savedFiles.set(fileName, buffer);
    return fileName;
  }

  async getFileUrl(fileId: string): Promise<string> {
    return `https://mocked.local/${fileId}`;
  }

  async getPublicFileUrl(fileId: string): Promise<string> {
    return `https://mocked-public.local/${fileId}`;
  }

  async fileExists(fileId: string): Promise<boolean> {
    return this.savedFiles.has(fileId);
  }

  async getFile(fileId: string): Promise<Buffer | null> {
    return this.savedFiles.get(fileId) ?? null;
  }

  async deleteById(fileId: string): Promise<void> {
    this.savedFiles.delete(fileId);
  }

  reset(): void {
    this.savedFiles.clear();
  }
}
