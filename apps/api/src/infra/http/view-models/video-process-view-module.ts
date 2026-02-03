import { VideoProcessingJob } from '@api/application/entities/video-processing-job';
import { FileManager } from '@file-manager';
import { VideoProcessingJobResponse } from '../dtos/video-processing';

export class VideoProcessingView {
  static async toHTTP(videoProcessingJob: VideoProcessingJob, fileManager: FileManager): Promise<VideoProcessingJobResponse> {
    return {
      id: videoProcessingJob.id,
      videoFile: await fileManager.getFileUrl(videoProcessingJob.videoFile ?? '', process.env.HOST || 'http://localhost', process.env.API_PORT || '3000'),
      status: videoProcessingJob.status
    };
  }
}
