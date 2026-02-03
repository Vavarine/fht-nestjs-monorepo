export class FileNotFound extends Error {
  constructor(fileName: string) {
    super(`File ${fileName} not found`);
  }
}
