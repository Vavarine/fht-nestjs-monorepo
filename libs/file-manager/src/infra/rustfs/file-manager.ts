import { FileManager } from "@file-manager/application/interface";
import { Injectable, Logger } from "@nestjs/common";
import { generateRandomFileName } from "@file-manager/utils/generate-random-file-name";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";

@Injectable()
export class RustFSFileManager implements FileManager {
  private readonly s3Client = new S3Client({});
  private readonly s3ClientPublic = new S3Client({});
  private readonly bucketName = process.env.FS_BUCKET_NAME!;
  private readonly logger = new Logger(RustFSFileManager.name);

  constructor() {
    this.s3Client = new S3Client({
      region: "cn-east-1",
      credentials: {
        accessKeyId: process.env.FS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.FS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
      endpoint: process.env.FS_ENDPOINT_URL!,
    });

    // Client for generating public URLs
    this.s3ClientPublic = new S3Client({
      region: "cn-east-1",
      credentials: {
        accessKeyId: process.env.FS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.FS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
      endpoint:
        process.env.FS_ENDPOINT_URL_PUBLIC || process.env.FS_ENDPOINT_URL!,
    });

    // Create the bucket if it doesn't exist
    void this.s3Client
      .send(new CreateBucketCommand({ Bucket: this.bucketName }))
      .then(() => {
        this.logger.log(`Bucket ${this.bucketName} created successfully.`);
      })
      .catch((err: any) => {
        const errName = err?.name ?? "";
        const statusCode = err?.$metadata?.httpStatusCode;

        if (
          errName === "BucketAlreadyOwnedByYou" ||
          errName === "BucketAlreadyExists" ||
          statusCode === 409
        ) {
          this.logger.debug(`Bucket ${this.bucketName} already exists.`);
          return;
        }

        this.logger.error(`Failed to create bucket ${this.bucketName}.`, err);
      });
  }

  async save(
    data: Buffer | Readable,
    fileId: string,
  ): Promise<string> {
    const randomFileName = generateRandomFileName(fileId);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: randomFileName,
        Body: data,
      }),
    );

    return randomFileName;
  }

  async deleteById(fileId: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileId,
      }),
    );
  }

  async fileExists(fileId: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: fileId,
        }),
      );

      return true;
    } catch (err: any) {
      if (err.name === "NotFound") {
        return false;
      }
      throw err;
    }
  }

  async getFileUrl(fileId: string): Promise<string> {
    const url = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileId,
        ResponseContentDisposition: "inline",
        ResponseContentType: "video/mp4",
      }),
      { expiresIn: 3600 },
    );

    return url;
  }

  async getPublicFileUrl(fileId: string): Promise<string> {
    const url = await getSignedUrl(
      this.s3ClientPublic,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileId,
        ResponseContentDisposition: "inline",
        ResponseContentType: "video/mp4",
      }),
      { expiresIn: 3600 },
    );

    return url;
  }

  async getFile(fileId: string): Promise<Buffer | null> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: fileId,
        }),
      );

      if (response.Body) {
        const chunks: Buffer[] = [];
        for await (const chunk of response.Body as any) {
          chunks.push(chunk as Buffer);
        }
        const data = Buffer.concat(chunks);

        return data;
      }
    } catch (error) {
      console.log(error);
    }

    return null;
  }
}
