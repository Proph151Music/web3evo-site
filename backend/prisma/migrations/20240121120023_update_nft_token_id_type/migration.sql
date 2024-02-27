/*
  Warnings:

  - The primary key for the `NftToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `NftToken` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `nftTokenId` on the `NftTokenMetaData` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `NftTokenMetaData` DROP FOREIGN KEY `NftTokenMetaData_nftTokenId_fkey`;

-- AlterTable
ALTER TABLE `NftToken` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `NftTokenMetaData` MODIFY `nftTokenId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `NftTokenMetaData` ADD CONSTRAINT `NftTokenMetaData_nftTokenId_fkey` FOREIGN KEY (`nftTokenId`) REFERENCES `NftToken`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
