-- AlterTable
ALTER TABLE "VideoProcessingJob" ADD COLUMN     "processedFile" TEXT,
ALTER COLUMN "videoFile" DROP NOT NULL;
