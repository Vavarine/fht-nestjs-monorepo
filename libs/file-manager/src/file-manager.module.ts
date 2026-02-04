import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileManager } from '@file-manager/application/interface';
import { DiskFileManager } from '@file-manager/infra/disk/file-manager';
import { S3FileManager } from './infra/s3/file-manager';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOADS_PATH || 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [
    {
      provide: FileManager,
      useClass: S3FileManager,
    },
  ],
  exports: [FileManager],
})
export class FileManagerModule {}
