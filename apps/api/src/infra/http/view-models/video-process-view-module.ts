import { VideoProcessingJob } from "@api/application/entities/video-processing-job";
import { FileManager } from "@file-manager";
import { VideoProcessingJobResponse } from "../dtos/video-processing";

export class VideoProcessingView {
  static async toHTTP(
    videoProcessingJob: VideoProcessingJob,
    fileManager: FileManager,
  ): Promise<VideoProcessingJobResponse> {
    const host = process.env.HOST || "http://localhost";
    const port = process.env.API_PORT || "3000";
    const baseUrl = `${host}:${port}`;

    return {
      id: videoProcessingJob.id,
      videoFile: await fileManager.getFileUrl(
        videoProcessingJob.videoFile ?? "",
        baseUrl,
      ),
      status: videoProcessingJob.status,
    };
  }
}
