/*
  Warnings:

  - A unique constraint covering the columns `[header_id,option_id]` on the table `result_ia05` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `result_ia05_header_id_option_id_key` ON `result_ia05`(`header_id`, `option_id`);
