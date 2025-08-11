import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterRequest, LoginRequest } from './auth.type';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../common/async.handler';

export class AuthController {
    static register = asyncHandler(async (req: Request, res: Response) => {
        const { email, password, confirm_password, role_id }: RegisterRequest = req.body;

        if (!email || !password || !confirm_password || !role_id) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, confirm_password, dan role_id wajib diisi'
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

        const result = await AuthService.register({ email, password, confirm_password, role_id });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    });

    static login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password }: LoginRequest = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const result = await AuthService.login({ email, password });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    });

    static me = asyncHandler(async (req: Request, res: Response) => {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is required'
            });
        }

        const decoded = await AuthService.verifyToken(token);

        const user = await AuthService.getMe(decoded.userId);

        res.status(200).json({
            success: true,
            data: user
        });
    });
} 