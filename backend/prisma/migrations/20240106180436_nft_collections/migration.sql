-- CreateTable
CREATE TABLE `NftCollection` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NftToken` (
    `id` VARCHAR(191) NOT NULL,
    `imageUri` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `collectionId` VARCHAR(191) NOT NULL,
    `dateMinted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NftToken_ownerId_collectionId_name_idx`(`ownerId`, `collectionId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NftTokenMetaData` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `nftTokenId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `NftTokenMetaData_key_nftTokenId_key`(`key`, `nftTokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NftCollection` ADD CONSTRAINT `NftCollection_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NftToken` ADD CONSTRAINT `NftToken_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NftToken` ADD CONSTRAINT `NftToken_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `NftCollection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NftTokenMetaData` ADD CONSTRAINT `NftTokenMetaData_nftTokenId_fkey` FOREIGN KEY (`nftTokenId`) REFERENCES `NftToken`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
