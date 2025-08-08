import { prisma } from '../../config/db';

export const getOccupations = async () => {
    return prisma.occupation.findMany({
        include: {
            scheme: true
        }
    });
};

export const getOccupationById = async (id: number) => {
    return prisma.occupation.findUnique({
        where: { id },
        include: {
            scheme: true
        }
    });
};

export const createOccupation = async (data: any) => {
    return prisma.occupation.create({ data });
};

export const updateOccupation = async (id: number, data: any) => {
    return prisma.occupation.update({ where: { id }, data });
};

export const deleteOccupation = async (id: number) => {
    return prisma.occupation.delete({ where: { id } });
};