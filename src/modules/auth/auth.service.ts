import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { RegisterRequest, LoginRequest, AuthResponse, JwtPayload } from './auth.type';
import { DuplicateEntryError, NotFoundError, ValidationError } from '../../common/error';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
    static async register(data: RegisterRequest): Promise<AuthResponse> {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new DuplicateEntryError('Pengguna', data.email);
        }

        const existingRole = await prisma.role.findUnique({
            where: { id: data.role_id }
        });

        if (!existingRole) {
            throw new ValidationError(`Role dengan ID ${data.role_id} tidak ditemukan. Pastikan role_id yang digunakan valid.`);
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const user = await prisma.user.create({
            data: {
                full_name: data.full_name,
                email: data.email,
                password: hashedPassword,
                role_id: data.role_id
            }
        });

        const token = this.generateToken(user.id, user.email);

        return {
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role_id: user.role_id
            },
            token
        };
    }

    static async login(data: LoginRequest): Promise<AuthResponse> {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                full_name: true,
                email: true,
                password: true,
                role_id: true
            }
        });

        if (!user) {
            throw new ValidationError('Email atau password tidak valid');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError('Email atau password tidak valid');
        }

        const token = this.generateToken(user.id, user.email);

        return {
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role_id: user.role_id
            },
            token
        };
    }

    static async getMe(userId: number): Promise<any> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                assessor: true,
                assessee: true,
                admin: true
            }
        });

        if (!user) {
            throw new NotFoundError('Pengguna');
        }

        return user;
    }

    static async verifyToken(token: string): Promise<JwtPayload> {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            return decoded;
        } catch (error) {
            throw new Error('Token tidak valid');
        }
    }

    private static generateToken(userId: number, email: string): string {
        const payload: JwtPayload = {
            userId,
            email
        };

        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
} 
