/*
  Warnings:

  - Made the column `description` on table `NftToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `NftToken` MODIFY `description` VARCHAR(191) NOT NULL DEFAULT '';
