import { prisma } from '../../config/db';
import { NotFoundError, DuplicateEntryError } from '../../common/error';

export class UserService {
    static async getUsers() {
        const users = await prisma.user.findMany({
            include: { role: true, assessee: true, assessor: true }
        });
        return users;
    }

    static async getUserById(id: number) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { role: true, assessee: true, assessor: true }
        });
        if (!user) throw new NotFoundError('User');
        return user;
    }

    static async createUser(data: any) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new DuplicateEntryError('User', data.email);

        const user = await prisma.user.create({
            data: {
                full_name: data.full_name || data.email.split('@')[0],
                email: data.email,
                password: data.password || 'password',
                role_id: data.role_id || 3
            },
        });

        return user;
    }

    static async createUserWithAssessor(data: any) {
    // expected data: either {
    //   email, password, full_name, role_id (2), assessor: { scheme_id, address, phone_no, birth_date }
    // } or flat payload: { email, password, full_name, scheme_id, address, phone_no, birth_date }
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new DuplicateEntryError('User', data.email);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    full_name: data.full_name || data.email.split('@')[0],
                    email: data.email,
                    password: data.password || 'password',
                    role_id: data.role_id ?? 2
                }
            });

            const assessorPayload = data.assessor || {
                scheme_id: data.scheme_id,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: data.birth_date
            };

            const assessor = await tx.assessor.create({
                data: {
                    user_id: user.id,
                    scheme_id: assessorPayload.scheme_id,
                    address: assessorPayload.address,
                    phone_no: assessorPayload.phone_no,
                    birth_date: new Date(assessorPayload.birth_date)
                }
            });

            return { user, assessor };
        });

        return result;
    }

    static async createUserWithAssessee(data: any) {
        // expected data: { email, password, full_name, role_id (3), assessee: { identity_number, birth_date, birth_location, gender, nationality, phone_no, address, educational_qualifications } }
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new DuplicateEntryError('User', data.email);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    full_name: data.full_name || data.email.split('@')[0],
                    email: data.email,
                    password: data.password || 'password',
                    role_id: data.role_id ?? 3
                }
            });

            const assesseePayload = data.assessee || {
                identity_number: data.identity_number,
                birth_date: data.birth_date,
                birth_location: data.birth_location,
                gender: data.gender,
                nationality: data.nationality,
                phone_no: data.phone_no,
                house_phone_no: data.house_phone_no,
                office_phone_no: data.office_phone_no,
                address: data.address,
                postal_code: data.postal_code,
                educational_qualifications: data.educational_qualifications
            };

            const assessee = await tx.assessee.create({
                data: {
                    user_id: user.id,
                    identity_number: assesseePayload.identity_number,
                    birth_date: new Date(assesseePayload.birth_date),
                    birth_location: assesseePayload.birth_location,
                    gender: assesseePayload.gender,
                    nationality: assesseePayload.nationality,
                    phone_no: assesseePayload.phone_no,
                    house_phone_no: assesseePayload.house_phone_no || null,
                    office_phone_no: assesseePayload.office_phone_no || null,
                    address: assesseePayload.address,
                    postal_code: assesseePayload.postal_code || null,
                    educational_qualifications: assesseePayload.educational_qualifications
                }
            });

            return { user, assessee };
        });

        return result;
    }

    static async updateUser(id: number, data: any) {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('User');

        const updated = await prisma.user.update({
            where: { id },
            data: {
                full_name: data.full_name ?? existing.full_name,
                email: data.email ?? existing.email,
                password: data.password ?? existing.password,
                role_id: data.role_id ?? existing.role_id,
            }
        });

        return updated;
    }

    static async deleteUser(id: number) {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('User');
        await prisma.user.delete({ where: { id } });
    }
}
