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
            throw new DuplicateEntryError('User', data.email);
        }

        const existingRole = await prisma.role.findUnique({
            where: { id: data.role_id }
        });

        if (!existingRole) {
            throw new NotFoundError('Role');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role_id: data.role_id
            }
        });

        const token = this.generateToken(user.id, user.email);

        return {
            user: {
                id: user.id,
                email: user.email,
                role_id: user.role_id
            },
            token
        };
    }

    static async login(data: LoginRequest): Promise<AuthResponse> {
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new ValidationError('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError('Invalid email or password');
        }

        const token = this.generateToken(user.id, user.email);

        return {
            user: {
                id: user.id,
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
            throw new NotFoundError('User');
        }

        return user;
    }

    static async verifyToken(token: string): Promise<JwtPayload> {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
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