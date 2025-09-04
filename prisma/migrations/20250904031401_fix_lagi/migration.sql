-- AddForeignKey
ALTER TABLE `result_ak03` ADD CONSTRAINT `result_ak03_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ak03_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
