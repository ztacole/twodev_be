/*
  Warnings:

  - A unique constraint covering the columns `[header_id,element_detail_id]` on the table `result_ia01` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `result_ia01_header_id_element_detail_id_key` ON `result_ia01`(`header_id`, `element_detail_id`);
