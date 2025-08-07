import { prisma } from '../../config/db';

export const getSchemes = async () => {
  return prisma.schemes.findMany();
};

export const getSchemeById = async (id: number) => {
  return prisma.schemes.findUnique({ where: { id } });
};

export const createScheme = async (data: any) => {
  return prisma.schemes.create({ data });
};

export const updateScheme = async (id: number, data: any) => {
  return prisma.schemes.update({ where: { id }, data });
};

export const deleteScheme = async (id: number) => {
  return prisma.schemes.delete({ where: { id } });
};
