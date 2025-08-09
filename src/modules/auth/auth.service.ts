import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { RegisterRequest, LoginRequest, AuthResponse, JwtPayload } from './auth.type';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('User already exists with this email');
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

    async login(data: LoginRequest): Promise<AuthResponse> {
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
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

    async verifyToken(token: string): Promise<JwtPayload> {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    private generateToken(userId: number, email: string): string {
        const payload: JwtPayload = {
            userId,
            email
        };

        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
} 