import { FileValidator } from '@nestjs/common';

export interface VideoFileTypeValidatorOptions {
  fileType: string | RegExp;
}

export class VideoFileTypeValidator extends FileValidator<VideoFileTypeValidatorOptions> {
  buildErrorMessage(): string {
    return `Validation failed (expected type is ${this.validationOptions.fileType})`;
  }

  public isValid(file?: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    const { mimetype } = file;
    const fileType = this.validationOptions.fileType;

    if (fileType instanceof RegExp) {
      return fileType.test(mimetype);
    }

    return mimetype === fileType;
  }
}
