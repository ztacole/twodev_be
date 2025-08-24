/*
  Warnings:

  - You are about to alter the column `approved_assessee` on the `result_ak04` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `TinyInt`.
  - A unique constraint covering the columns `[result_id]` on the table `result_ak01_header` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ak02_header` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ak03` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ak04` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ak05` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_apl02_header` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ia01_header` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ia02_header` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ia03_header` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ia05_header` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[result_id]` on the table `result_ia07_header` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `result_ak04` MODIFY `approved_assessee` BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `result_ak01_header_result_id_key` ON `result_ak01_header`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ak02_header_result_id_key` ON `result_ak02_header`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ak03_result_id_key` ON `result_ak03`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ak04_result_id_key` ON `result_ak04`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ak05_result_id_key` ON `result_ak05`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_apl02_header_result_id_key` ON `result_apl02_header`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ia01_header_result_id_key` ON `result_ia01_header`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ia02_header_result_id_key` ON `result_ia02_header`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ia03_header_result_id_key` ON `result_ia03_header`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ia05_header_result_id_key` ON `result_ia05_header`(`result_id`);

-- CreateIndex
CREATE UNIQUE INDEX `result_ia07_header_result_id_key` ON `result_ia07_header`(`result_id`);
