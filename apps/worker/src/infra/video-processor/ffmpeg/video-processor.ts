import { VideoProcessor } from "@worker/application/video-processor/video-processor";
import { Injectable, Logger } from "@nestjs/common";
import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { promisify } from "node:util";
import * as archiver from "archiver";

const execFileAsync = promisify(execFile);

@Injectable()
export class ffmpegVideoProcessor implements VideoProcessor {
  private readonly logger = new Logger(ffmpegVideoProcessor.name);

  async process(
    inputPath: string,
    videoProcessingJobId: string,
  ): Promise<Buffer> {
    const outputPath = join("/tmp", videoProcessingJobId);

    this.logger.log(`Processing video: ${videoProcessingJobId}`);

    try {
      await mkdir(outputPath, { recursive: true });
      await execFileAsync("ffmpeg", [
        "-i",
        inputPath,
        "-vf",
        "fps=1",
        "-y",
        join(outputPath, "frame_%04d.png"),
      ]);

      return await this.zipDirectoryToBuffer(outputPath);
    } catch (error) {
      const ffmpegError = error as {
        stderr?: Buffer | string;
        message?: string;
      };
      const details =
        ffmpegError.stderr?.toString() ??
        ffmpegError.message ??
        "Unknown error";

      throw new Error(`ffmpeg failed: ${details}`);
    }
  }

  private async zipDirectoryToBuffer(sourceDir: string): Promise<Buffer> {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = new PassThrough();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      output.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      output.on("end", () => resolve(Buffer.concat(chunks)));
      output.on("error", reject);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}
