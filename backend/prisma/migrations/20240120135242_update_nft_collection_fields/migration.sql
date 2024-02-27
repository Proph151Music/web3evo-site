/*
  Warnings:

  - You are about to drop the column `description` on the `NftCollection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `NftCollection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `NftCollection` DROP COLUMN `description`;

-- CreateIndex
CREATE UNIQUE INDEX `NftCollection_name_key` ON `NftCollection`(`name`);
