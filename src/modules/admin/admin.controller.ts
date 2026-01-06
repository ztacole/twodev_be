import { Request, Response } from 'express';
import { asyncHandler } from '../../common/async.handler';
import { AdminService } from './admin.service';
import fs from 'fs';
import path from 'path';

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
        const { user_id, address, phone_no, birth_date, can_approve } = req.body;
        
        if (!user_id || !address || !phone_no || !birth_date) {
            return res.status(400).json({ 
                success: false, 
                message: 'user_id, address, phone_no, dan birth_date wajib diisi' 
            });
        }

        let signatureUrl: string | undefined = undefined;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        if (files && files.signature && files.signature[0]) {
            signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
        }

        const data = await AdminService.createAdmin({ 
            user_id,
            address, 
            phone_no, 
            birth_date,
            can_approve: can_approve === undefined ? undefined : Boolean(Number(can_approve)),
            signature: signatureUrl
        });
        res.status(201).json({ 
            success: true, 
            message: 'Admin berhasil dibuat', 
            data 
        });
    }),

    updateAdmin: asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const { full_name, email, address, phone_no, birth_date, can_approve } = req.body;

        if (!full_name && !email && !address && !phone_no && !birth_date && can_approve === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Minimal satu field (full_name, email, address, phone_no, birth_date, atau can_approve) harus diisi'
            });
        }

        const data = await AdminService.updateAdmin(id, {
            full_name,
            email,
            address,
            phone_no,
            birth_date,
            can_approve: can_approve === undefined ? undefined : Boolean(Number(can_approve))
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
        const { full_name, email, password, address, phone_no, birth_date, can_approve } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau user tidak ditemukan'
            });
        }

        if (!full_name && !email && !password && !address && !phone_no && !birth_date && can_approve === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Minimal satu field (full_name, email, password, address, phone_no, birth_date, atau can_approve) harus diisi'
            });
        }

        let signatureUrl: string | undefined = undefined;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        
        const allAdmins = await AdminService.getAdmins();
        const existingAdmin = allAdmins.find((admin: any) => admin.user_id === userId);
        
        if (files && files.signature && files.signature[0]) {
            if (existingAdmin?.signature) {
                try {
                    const oldFilePath = path.join(__dirname, '../../../public', existingAdmin.signature);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (error) {
                    // Ignore error if file doesn't exist
                }
            }
            signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
        }

        const data = await AdminService.updateAdminByUserId(userId, {
            full_name,
            email,
            password,
            address,
            phone_no,
            birth_date,
            can_approve: can_approve === undefined ? undefined : Boolean(Number(can_approve)),
            signature: signatureUrl
        });

        res.json({
            success: true,
            message: 'Profil admin berhasil diperbarui',
            data
        });
    })
};
