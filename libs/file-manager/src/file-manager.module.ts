import { Module } from "@nestjs/common";
import { FileManager } from "@file-manager/application/interface";
import { RustFSFileManager } from "./infra/rustfs/file-manager";

@Module({
  providers: [
    {
      provide: FileManager,
      useClass: RustFSFileManager,
    },
  ],
  exports: [FileManager],
})
export class FileManagerModule {}
