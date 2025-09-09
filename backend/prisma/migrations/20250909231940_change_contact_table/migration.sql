/*
  Warnings:

  - You are about to drop the column `email` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `linkedUserId` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `contact` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nickname` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `contact` DROP FOREIGN KEY `Contact_linkedUserId_fkey`;

-- DropForeignKey
ALTER TABLE `contact` DROP FOREIGN KEY `Contact_ownerId_fkey`;

-- DropIndex
DROP INDEX `Contact_linkedUserId_fkey` ON `contact`;

-- DropIndex
DROP INDEX `Contact_ownerId_email_key` ON `contact`;

-- AlterTable
ALTER TABLE `contact` DROP COLUMN `email`,
    DROP COLUMN `linkedUserId`,
    DROP COLUMN `name`,
    DROP COLUMN `ownerId`,
    ADD COLUMN `contact_id` VARCHAR(191) NULL,
    ADD COLUMN `is_blocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `nickname` VARCHAR(191) NOT NULL,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Contact_user_id_key` ON `Contact`(`user_id`);

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
