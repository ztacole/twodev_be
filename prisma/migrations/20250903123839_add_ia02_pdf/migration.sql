-- CreateTable
CREATE TABLE `ia02_pdf` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ia02_pdf` ADD CONSTRAINT `ia02_pdf_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
