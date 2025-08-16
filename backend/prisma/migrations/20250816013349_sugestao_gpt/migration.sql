/*
  Warnings:

  - You are about to drop the column `contact_id` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `chat_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `chat_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `contacts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user1Id,user2Id]` on the table `chats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user1Id` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatId` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_contact_id_fkey`;

-- DropForeignKey
ALTER TABLE `contacts` DROP FOREIGN KEY `contacts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_chat_id_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_chat_id_fkey`;

-- DropIndex
DROP INDEX `chats_contact_id_fkey` ON `chats`;

-- DropIndex
DROP INDEX `messages_chat_id_fkey` ON `messages`;

-- DropIndex
DROP INDEX `messages_user_id_fkey` ON `messages`;

-- DropIndex
DROP INDEX `notifications_chat_id_fkey` ON `notifications`;

-- AlterTable
ALTER TABLE `chats` DROP COLUMN `contact_id`,
    DROP COLUMN `created_at`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `user1Id` VARCHAR(191) NOT NULL,
    ADD COLUMN `user2Id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `messages` DROP COLUMN `chat_id`,
    DROP COLUMN `created_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `chatId` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `senderId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `chat_id`,
    DROP COLUMN `created_at`,
    DROP COLUMN `is_read`,
    ADD COLUMN `chatId` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `created_at`,
    DROP COLUMN `password_hash`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `passwordHash` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `contacts`;

-- CreateTable
CREATE TABLE `user_contacts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_contacts_userId_contactId_key`(`userId`, `contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `chats_user1Id_user2Id_key` ON `chats`(`user1Id`, `user2Id`);

-- AddForeignKey
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
