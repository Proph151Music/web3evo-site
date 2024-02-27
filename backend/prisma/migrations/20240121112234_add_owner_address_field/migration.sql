/*
  Warnings:

  - Added the required column `ownerAddress` to the `NftToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `NftToken` ADD COLUMN `ownerAddress` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL DEFAULT '';
