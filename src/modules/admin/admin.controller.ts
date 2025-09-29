import { Request, Response } from 'express';
import { asyncHandler } from '../../common/async.handler';
import { AdminService } from './admin.service';

export const AdminController = {
    getAdmins: asyncHandler(async (_req: Request, res: Response) => {
        const data = await AdminService.getAdmins();
        res.json({ success: true, message: 'Daftar admin', data });
    }),

    getAdminById: asyncHandler(async (req: Request, res: Response) => {
        const data = await AdminService.getAdminById(Number(req.params.id));
        if (!data) return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
        res.json({ success: true, message: 'Detail admin', data });
    }),
};
