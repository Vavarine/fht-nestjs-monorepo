import {
  ProcessedVideoArtifact,
  VideoProcessor,
} from "@video-processor/application/video-processor/video-processor";
import { Injectable, Logger } from "@nestjs/common";
import { execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import * as archiver from "archiver";

const execFileAsync = promisify(execFile);

@Injectable()
export class ffmpegVideoProcessor implements VideoProcessor {
  private readonly logger = new Logger(ffmpegVideoProcessor.name);

  async process(
    inputPath: string,
    videoProcessingJobId: string,
  ): Promise<ProcessedVideoArtifact> {
    const outputPath = join("/tmp", videoProcessingJobId);
    const zipFilePath = `${outputPath}.zip`;

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

      await this.zipDirectoryToFile(outputPath, zipFilePath);

      return {
        zipFilePath,
        outputDirPath: outputPath,
      };
    } catch (error) {
      await this.cleanup(outputPath, zipFilePath);

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

  async cleanup(outputPath: string, zipFilePath: string): Promise<void> {
    await rm(outputPath, { recursive: true, force: true });
    await rm(zipFilePath, { force: true });
  }

  private async zipDirectoryToFile(
    sourceDir: string,
    zipFilePath: string,
  ): Promise<void> {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = createWriteStream(zipFilePath);

    return new Promise((resolve, reject) => {
      output.on("close", () => resolve());
      output.on("error", reject);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}
