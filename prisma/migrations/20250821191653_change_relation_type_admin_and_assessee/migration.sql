-- DropForeignKey
ALTER TABLE `assessee` DROP FOREIGN KEY `assessee_user_id_fkey`;

-- DropIndex
DROP INDEX `assessee_user_id_key` ON `assessee`;

-- AddForeignKey
-- ALTER TABLE `occupation` ADD CONSTRAINT `occupation_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `scheme`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
