import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { JwtPayload } from '../modules/auth/auth.type';

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
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
                message: 'Token akses diperlukan'
            });
        }

        const decoded = await AuthService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error: any) {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa'
        });
    }
}; 

export const adminMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role_id !== 1) {
        return res.status(403).json({ message: 'Akses hanya untuk admin' });
    }
    next();
};

export const authUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await adminMiddleware(req, res, next);
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYXNlc2kxQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MywiaWF0IjoxNzU1OTk5MzE1LCJleHAiOjE3NTY2MDQxMTV9.Q-AqqcntscCW1Duy5GlCOThPzzNZlx5sfpl4-4hbdKc";

        if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
        }

        next();
    } catch (error: any) {
        return res.status(403).json({ message: error.message });
    }
};