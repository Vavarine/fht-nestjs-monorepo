import { FileManager } from "@file-manager/application/interface";
import { Injectable } from '@nestjs/common';
import { generateRandomFileName } from "@file-manager/utils/generate-random-file-name";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3FileManager implements FileManager {
  private readonly s3Client = new S3Client({});
  private readonly bucketName = process.env.RUSTFS_BUCKET_NAME!;

  constructor() {
    this.s3Client = new S3Client({
      region: "cn-east-1",
      credentials: {
        accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.RUSTFS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
      endpoint: process.env.RUSTFS_ENDPOINT_URL!,
    });
  }

  async save(data: Buffer, filename: string): Promise<string> {
    const randomFileName = generateRandomFileName(filename);

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: randomFileName,
      Body: data,
    }));

    return randomFileName;
  }

  async deleteByFileName(filename: string): Promise<void> {
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
    }));
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      const a = await this.s3Client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      }));

      return true;
    } catch (err: any) {
      if (err.name === 'NotFound') {
        return false;
      }
      throw err;
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    const url = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({ Bucket: this.bucketName, Key: filename,
        ResponseContentDisposition: "inline",
        ResponseContentType: "video/mp4",
      }),
      { expiresIn: 3600 }
    );

    return url;
  }
}
