// import { prisma } from '../../config/db';
// import { MajorRequest, MajorResponse } from './major.type';

// export class MajorService {
//     async getMajors(): Promise<MajorResponse[]> {
//         return await prisma.major.findMany();
//     };

//     async createMajor(data: MajorRequest): Promise<MajorResponse> {
//         return await prisma.major.create({ data });
//     };

//     async updateMajor(id: number, data: MajorRequest): Promise<MajorResponse> {
//         return await prisma.major.update({ where: { id }, data });
//     };

//     async deleteMajor(id: number): Promise<MajorResponse> {
//         return await prisma.major.delete({ where: { id } });
//     };
// }