import { prisma } from '../../config/db';

export const createAssessor = async (data: any) => {
  return prisma.assessor.create({ data });
};

export const getAssessors = async () => {
  return prisma.assessor.findMany();
};

export const getAssessorById = async (id: number) => {
  return prisma.assessor.findUnique({ where: { id } });
};

export const updateAssessor = async (id: number, data: any) => {
  return prisma.assessor.update({ where: { id }, data });
};

export const deleteAssessor = async (id: number) => {
  return prisma.assessor.delete({ where: { id } });
};
