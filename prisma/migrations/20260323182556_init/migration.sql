-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('Author', 'Buyer', 'Publisher') NOT NULL DEFAULT 'Author';
