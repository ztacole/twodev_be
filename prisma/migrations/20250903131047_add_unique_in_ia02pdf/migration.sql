/*
  Warnings:

  - A unique constraint covering the columns `[group_id]` on the table `ia02_pdf` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ia02_pdf_group_id_key` ON `ia02_pdf`(`group_id`);
