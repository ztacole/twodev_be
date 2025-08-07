import { prisma } from '../../config/db';

export const createAssessement = async (data: any) => {
  return prisma.assessment.create({ data });
};

export const getAssessements = async () => {
  return prisma.assessment.findMany();
};

export const getAssessementById = async (id: number) => {
  return prisma.assessment.findUnique({ where: { id } });
};

export const updateAssessement = async (id: number, data: any) => {
  return prisma.assessment.update({ where: { id }, data });
};

export const deleteAssessement = async (id: number) => {
  return prisma.assessment.delete({ where: { id } });
};
