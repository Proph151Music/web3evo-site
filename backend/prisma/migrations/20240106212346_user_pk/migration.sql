/*
  Warnings:

  - Added the required column `privateKey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `privateKey` VARCHAR(191) NOT NULL;
