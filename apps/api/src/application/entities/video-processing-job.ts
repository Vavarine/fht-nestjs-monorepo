import { randomUUID } from "node:crypto";

export enum VideoProcessingJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface VideoProcessingJobProps {
  videoFile: string | null;
  processedFile?: string;
  status: VideoProcessingJobStatus;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
}

export class VideoProcessingJob {
  public id: string;
  private props: VideoProcessingJobProps;
  static Status = VideoProcessingJobStatus;

  constructor(props: VideoProcessingJobProps, id?: string) {
    this.id = id ?? randomUUID();
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get videoFile(): string | null {
    return this.props.videoFile ?? null;
  }

  public set videoFile(videoFile: string) {
    this.props.videoFile = videoFile;
  }

  public get processedFile(): string | undefined {
    return this.props.processedFile;
  }

  public set processedFile(processedFile: string) {
    this.props.processedFile = processedFile;
  }

  public get status() {
    return this.props.status;
  }

  public set status(status: VideoProcessingJobStatus) {
    this.props.status = status;
  }

  public get userId() {
    return this.props.userId;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
