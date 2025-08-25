-- DropForeignKey
ALTER TABLE `result_ak03` DROP FOREIGN KEY `result_ak03_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ak05` DROP FOREIGN KEY `result_ak05_result_id_fkey`;

-- DropIndex
DROP INDEX `result_ak03_result_id_key` ON `result_ak03`;

-- DropIndex
DROP INDEX `result_ak05_result_id_key` ON `result_ak05`;

-- AddForeignKey
ALTER TABLE `result_ak03` ADD CONSTRAINT `result_ak03_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak05` ADD CONSTRAINT `result_ak05_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
