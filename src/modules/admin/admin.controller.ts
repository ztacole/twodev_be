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
        const { full_name, email, password, role_id, address, phone_no, birth_date } = req.body;
        
        if (!full_name || !email || !password || !address || !phone_no || !birth_date) {
            return res.status(400).json({ 
                success: false, 
                message: 'full_name, email, password, address, phone_no, dan birth_date wajib diisi' 
            });
        }

        const data = await AdminService.createAdmin({ 
            full_name,
            email,
            password,
            role_id,
            address, 
            phone_no, 
            birth_date 
        });
        res.status(201).json({ 
            success: true, 
            message: 'Admin berhasil dibuat', 
            data 
        });
    }),

    updateAdmin: asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const { full_name, email, address, phone_no, birth_date } = req.body;

        if (!full_name && !email && !address && !phone_no && !birth_date) {
            return res.status(400).json({
                success: false,
                message: 'Minimal satu field (full_name, email, address, phone_no, atau birth_date) harus diisi'
            });
        }

        const data = await AdminService.updateAdmin(id, {
            full_name,
            email,
            address,
            phone_no,
            birth_date
        });

        res.json({
            success: true,
            message: 'Admin berhasil diperbarui',
            data
        });
    }),

    deleteAdmin: asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const data = await AdminService.deleteAdmin(id);

        res.json({
            success: true,
            message: data.message,
            data: { id: data.id }
        });
    }),

    updateMyProfile: asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id; // Get user ID from token
        const { full_name, email, password, address, phone_no, birth_date } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau user tidak ditemukan'
            });
        }

        if (!full_name && !email && !password && !address && !phone_no && !birth_date) {
            return res.status(400).json({
                success: false,
                message: 'Minimal satu field (full_name, email, password, address, phone_no, atau birth_date) harus diisi'
            });
        }

        const data = await AdminService.updateAdminByUserId(userId, {
            full_name,
            email,
            password,
            address,
            phone_no,
            birth_date
        });

        res.json({
            success: true,
            message: 'Profil admin berhasil diperbarui',
            data
        });
    })
};
