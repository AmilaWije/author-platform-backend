/*
  Warnings:

  - Added the required column `amount` to the `Agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Agreement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `agreement` ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
