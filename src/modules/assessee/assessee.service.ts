import { prisma } from '../../config/db';

export const getAssesses = async () => {
  return prisma.assessee.findMany();
};

export const getAssesseById = async (id: number) => {
  return prisma.assessee.findUnique({ where: { id } });
};

export const createAssesse = async (data: any) => {
  return prisma.assessee.create({ data });
};

export const updateAssesse = async (id: number, data: any) => {
  return prisma.assessee.update({ where: { id }, data });
};

export const deleteAssesse = async (id: number) => {
  return prisma.assessee.delete({ where: { id } });
};
