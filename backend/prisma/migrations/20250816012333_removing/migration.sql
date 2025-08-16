/*
  Warnings:

  - You are about to drop the column `email` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_user_id_fkey`;

-- DropIndex
DROP INDEX `chats_email_key` ON `chats`;

-- DropIndex
DROP INDEX `chats_user_id_fkey` ON `chats`;

-- DropIndex
DROP INDEX `notifications_user_id_fkey` ON `notifications`;

-- AlterTable
ALTER TABLE `chats` DROP COLUMN `email`,
    DROP COLUMN `name`,
    DROP COLUMN `user_id`;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `user_id`;
