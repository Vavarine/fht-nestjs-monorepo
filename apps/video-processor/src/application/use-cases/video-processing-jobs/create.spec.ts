import { FileManagerMock } from "@test/mocks/file-manager.mock";
import { VideoProcessingPublisherJobMock } from "@test/mocks/video-processing-publisher.mock";
import { ProcessVideo } from "./process-video";
import { VideoProcessingJobStatus } from "@api/application/entities/video-processing-job";

// Mock fs module
jest.mock("node:fs", () => ({
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
    on: jest.fn(),
  })),
}));

jest.mock("node:fs/promises", () => ({
  rm: jest.fn().mockResolvedValue(undefined),
}));

// Mock for VideoProcessor
class VideoProcessorMock {
  async process(fileUrl: string, jobId: string): Promise<any> {
    return {
      zipFilePath: `/tmp/${jobId}.zip`,
      outputDirPath: `/tmp/${jobId}`,
    };
  }
}

describe("ProcessVideo", () => {
  let processVideo: ProcessVideo;
  let fileManager: FileManagerMock;
  let videoProcessor: VideoProcessorMock;
  let videoProcessingPublisher: VideoProcessingPublisherJobMock;

  beforeEach(() => {
    fileManager = new FileManagerMock();
    videoProcessor = new VideoProcessorMock();
    videoProcessingPublisher = new VideoProcessingPublisherJobMock();
    processVideo = new ProcessVideo(
      fileManager as any,
      videoProcessor as any,
      videoProcessingPublisher as any,
    );
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe("video processing", () => {
    it("should publish PROCESSING status at the start", async () => {
      const request = {
        videoProcessingJobId: "job-123",
        fileId: "file-456",
      };

      await processVideo.execute(request);

      const firstMessage = videoProcessingPublisher.publishedMessages[0];
      expect(firstMessage.status).toBe(VideoProcessingJobStatus.PROCESSING);
      expect(firstMessage.jobId).toBe("job-123");
    });

    it("should get file URL from FileManager", async () => {
      const request = {
        videoProcessingJobId: "job-123",
        fileId: "file-456",
      };

      const getFileUrlSpy = jest.spyOn(fileManager, "getFileUrl");

      await processVideo.execute(request);

      expect(getFileUrlSpy).toHaveBeenCalledWith(
        "file-456",
        expect.any(String),
      );
    });

    it("should process the video using VideoProcessor", async () => {
      const request = {
        videoProcessingJobId: "job-123",
        fileId: "file-456",
      };

      const processSpy = jest.spyOn(videoProcessor, "process");

      await processVideo.execute(request);

      expect(processSpy).toHaveBeenCalledWith(
        expect.stringContaining("file-456"),
        "job-123",
      );
    });

    it("should publish COMPLETED status on success", async () => {
      const request = {
        videoProcessingJobId: "job-123",
        fileId: "file-456",
      };

      await processVideo.execute(request);

      const completedMessage = videoProcessingPublisher.publishedMessages.find(
        (msg) => msg.status === VideoProcessingJobStatus.COMPLETED,
      );
      expect(completedMessage).toBeDefined();
      expect(completedMessage?.jobId).toBe("job-123");
      expect(completedMessage?.fileName).toContain("job-123.zip");
    });

    it("should publish FAILED status on error", async () => {
      const request = {
        videoProcessingJobId: "job-123",
        fileId: "file-456",
      };

      videoProcessor.process = jest
        .fn()
        .mockRejectedValue(new Error("Processing failed"));

      await processVideo.execute(request);

      const failedMessage = videoProcessingPublisher.publishedMessages.find(
        (msg) => msg.status === VideoProcessingJobStatus.FAILED,
      );
      expect(failedMessage).toBeDefined();
      expect(failedMessage?.jobId).toBe("job-123");
    });

    it("should delete the original file after successful processing", async () => {
      const request = {
        videoProcessingJobId: "job-123",
        fileId: "file-456",
      };

      const deleteByIdSpy = jest.spyOn(fileManager, "deleteById");

      await processVideo.execute(request);

      expect(deleteByIdSpy).toHaveBeenCalledWith("file-456");
    });

    it("should handle multiple video processing jobs independently", async () => {
      const request1 = {
        videoProcessingJobId: "job-111",
        fileId: "file-111",
      };
      const request2 = {
        videoProcessingJobId: "job-222",
        fileId: "file-222",
      };

      await processVideo.execute(request1);
      await processVideo.execute(request2);

      const job1Messages = videoProcessingPublisher.publishedMessages.filter(
        (msg) => msg.jobId === "job-111",
      );
      const job2Messages = videoProcessingPublisher.publishedMessages.filter(
        (msg) => msg.jobId === "job-222",
      );

      expect(job1Messages.length).toBeGreaterThan(0);
      expect(job2Messages.length).toBeGreaterThan(0);
    });
  });
});
