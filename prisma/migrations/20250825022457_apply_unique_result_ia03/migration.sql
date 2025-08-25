/*
  Warnings:

  - A unique constraint covering the columns `[header_id,question_id]` on the table `result_ia03` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `result_ia03_header_id_question_id_key` ON `result_ia03`(`header_id`, `question_id`);
