import { prisma } from '../../config/db';

export const createAssessor = async (data: {
  user_id: number;
  full_name: string;
  scheme_id: number;
  address: string;
  phone_no: string;
  birth_date: Date;
}) => {
  return prisma.assessor.create({ 
    data,
    include: {
      user: {
        include: {
          role: true
        }
      },
      scheme: true
    }
  });
};

export const getAssessors = async () => {
  return prisma.assessor.findMany({
    include: {
      user: {
        include: {
          role: true
        }
      },
      scheme: true
    }
  });
};

export const getAssessorById = async (id: number) => {
  return prisma.assessor.findUnique({ 
    where: { id },
    include: {
      user: {
        include: {
          role: true
        }
      },
      scheme: true
    }
  });
};

export const updateAssessor = async (id: number, data: {
  full_name?: string;
  scheme_id?: number;
  address?: string;
  phone_no?: string;
  birth_date?: Date;
}) => {
  return prisma.assessor.update({ 
    where: { id }, 
    data,
    include: {
      user: {
        include: {
          role: true
        }
      },
      scheme: true
    }
  });
};

export const deleteAssessor = async (id: number) => {
  return prisma.assessor.delete({ where: { id } });
};
