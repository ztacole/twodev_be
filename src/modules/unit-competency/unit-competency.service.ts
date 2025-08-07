import { prisma } from '../../config/db';

export const getUnitCompetencies = async () => {
    return prisma.unit_Competency.findMany({
        include: {
            assessment: true,
            elements: true
        }
    });
};

export const getUnitCompetencyById = async (id: number) => {
    return prisma.unit_Competency.findUnique({
        where: { id },
        include: {
            assessment: true,
            elements: true
        }
    });
};

export const createUnitCompetency = async (data: any) => {
    return prisma.unit_Competency.create({ data });
};

export const updateUnitCompetency = async (id: number, data: any) => {
    return prisma.unit_Competency.update({ where: { id }, data });
};

export const deleteUnitCompetency = async (id: number) => {
    return prisma.unit_Competency.delete({ where: { id } });
};