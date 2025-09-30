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

    createAdmin: asyncHandler(async (req: Request, res: Response) => {
        const { user_id, address, phone_no, birth_date } = req.body;
        
        if (!user_id || !address || !phone_no || !birth_date) {
            return res.status(400).json({ 
                success: false, 
                message: 'user_id, address, phone_no, dan birth_date wajib diisi' 
            });
        }

        const data = await AdminService.createAdmin({ 
            user_id, 
            address, 
            phone_no, 
            birth_date 
        });
        res.status(201).json({ 
            success: true, 
            message: 'Admin berhasil dibuat', 
            data 
        });
    })
};
