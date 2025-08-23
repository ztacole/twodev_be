/*
  Warnings:

  - Added the required column `updated_at` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ak02_evidence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `apl02_evidence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assessee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assessee_job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assessment_schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assessor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assessor_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `element_apl02` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `element_details_apl02` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `element_details_ia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `element_ia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `group_ia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ia02_tool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ia03_question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ia05_question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ia07_question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `occupation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `question_option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ak01` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ak01_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ak02` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ak02_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ak04` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ak05` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_apl02` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_apl02_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_doc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia01` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia01_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia02_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia03_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia05` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia05_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia07` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `result_ia07_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `schedule_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `scheme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `uc_apl02` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `uc_ia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ak02_evidence` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `apl02_evidence` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `assessee` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `assessee_job` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `assessment` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `assessment_schedule` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `assessor` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `assessor_detail` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `element_apl02` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `element_details_apl02` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `element_details_ia` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `element_ia` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `group_ia` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ia02_tool` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ia03_question` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ia05_question` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ia07_question` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `occupation` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `question_option` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result` ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak01` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak01_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak02` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak02_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak03` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak04` ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak05` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_apl02` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_apl02_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_doc` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia01` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia01_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia02_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia03` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia03_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia05` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia05_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia07` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `result_ia07_header` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `schedule_detail` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `scheme` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `uc_apl02` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `uc_ia` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
