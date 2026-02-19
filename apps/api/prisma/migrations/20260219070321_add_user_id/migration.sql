/*
  Warnings:

  - Added the required column `userId` to the `VideoProcessingJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoProcessingJob" ADD COLUMN     "userId" TEXT NOT NULL;
