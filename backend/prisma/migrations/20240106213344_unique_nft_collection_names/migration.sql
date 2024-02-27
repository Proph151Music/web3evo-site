/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name]` on the table `NftCollection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `NftCollection_ownerId_name_key` ON `NftCollection`(`ownerId`, `name`);
