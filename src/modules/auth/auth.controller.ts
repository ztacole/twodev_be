import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterRequest, LoginRequest } from './auth.type';
import { prisma } from '../../config/db';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(req: Request, res: Response) {
        try {
            const { full_name, email, password, confirm_password, role_id }: RegisterRequest = req.body;

            if (!full_name || !email || !password || !confirm_password || !role_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Full name, email, password, confirm_password, dan role_id wajib diisi'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password minimal 6 karakter'
                });
            }

            if (password !== confirm_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Password dan confirm password tidak sama'
                });
            }

            const result = await this.authService.register({ full_name, email, password, confirm_password, role_id });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password }: LoginRequest = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await this.authService.login({ email, password });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async me(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is required'
                });
            }

            const decoded = await this.authService.verifyToken(token);

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    role_id: true,
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }
} 