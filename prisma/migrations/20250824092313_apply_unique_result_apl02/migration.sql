/*
  Warnings:

  - A unique constraint covering the columns `[result_apl02_id,element_id]` on the table `result_apl02` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `result_apl02_result_apl02_id_element_id_key` ON `result_apl02`(`result_apl02_id`, `element_id`);
