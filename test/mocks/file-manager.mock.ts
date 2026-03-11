export class FileManagerMock {
  public savedFiles: Map<string, Buffer | any> = new Map();

  async save(buffer: Buffer | any, originalFileName: string): Promise<string> {
    const fileName = `mocked-${Date.now()}-${originalFileName}`;
    this.savedFiles.set(fileName, buffer);
    return fileName;
  }

  async getFileUrl(fileId: string, endpoint: string): Promise<string> {
    return `${endpoint}/mocked/${fileId}`;
  }

  async deleteById(fileId: string): Promise<void> {
    this.savedFiles.delete(fileId);
  }

  reset(): void {
    this.savedFiles.clear();
  }
}
