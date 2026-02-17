import { Module } from "@nestjs/common";
import { FileManager } from "@file-manager/application/interface";
import { S3FileManager } from "./infra/s3/file-manager";

@Module({
  providers: [
    {
      provide: FileManager,
      useClass: S3FileManager,
    },
  ],
  exports: [FileManager],
})
export class FileManagerModule {}
