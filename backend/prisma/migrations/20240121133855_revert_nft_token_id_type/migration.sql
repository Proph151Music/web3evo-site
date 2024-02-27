/*
  Warnings:

  - The primary key for the `NftToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `nftId` to the `NftToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `NftTokenMetaData` DROP FOREIGN KEY `NftTokenMetaData_nftTokenId_fkey`;

-- AlterTable
ALTER TABLE `NftToken` DROP PRIMARY KEY,
    ADD COLUMN `nftId` INTEGER NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `NftTokenMetaData` MODIFY `nftTokenId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `NftTokenMetaData` ADD CONSTRAINT `NftTokenMetaData_nftTokenId_fkey` FOREIGN KEY (`nftTokenId`) REFERENCES `NftToken`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
