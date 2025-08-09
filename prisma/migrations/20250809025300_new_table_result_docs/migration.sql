-- CreateTable
CREATE TABLE `Result_Docs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `assessor_id` INTEGER NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `school_report_card` VARCHAR(191) NOT NULL,
    `field_work_practice_certificate` VARCHAR(191) NOT NULL,
    `student_card` VARCHAR(191) NOT NULL,
    `family_card` VARCHAR(191) NOT NULL,
    `id_card` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Result_Docs` ADD CONSTRAINT `Result_Docs_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Docs` ADD CONSTRAINT `Result_Docs_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
