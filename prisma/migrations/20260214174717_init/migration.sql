/*
  Warnings:

  - You are about to drop the column `path` on the `book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `book` DROP COLUMN `path`,
    ADD COLUMN `summary` VARCHAR(191) NULL;
