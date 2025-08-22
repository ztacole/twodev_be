-- AddForeignKey
ALTER TABLE `assessee` ADD CONSTRAINT `assessee_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
