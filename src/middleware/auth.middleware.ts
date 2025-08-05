import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const decoded = await authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error: any) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}; 