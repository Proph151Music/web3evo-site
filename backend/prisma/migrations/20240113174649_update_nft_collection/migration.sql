/*
  Warnings:

  - Added the required column `logoUrl` to the `NftCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `NftCollection` ADD COLUMN `description` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `logoUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `tokensCount` INTEGER NOT NULL DEFAULT 0;
