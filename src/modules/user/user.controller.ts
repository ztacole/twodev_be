import { Request, Response } from 'express';
import { UserService } from './user.service';
import { asyncHandler } from '../../common/async.handler';

export class UserController {
    static createUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.createUser(req.body);
        res.status(201).json({
            success: true,
            message: 'User berhasil dibuat',
            data: user
        });
    });

    static getUsers = asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
        const result = await UserService.getUsers(page, limit);
        return res.status(200).json({
            success: true,
            message: 'Daftar user berhasil diambil',
            data: result.data,
            meta: result.meta
        });
    });

    static getUserById = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.getUserById(Number(req.params.id));
        res.status(200).json({
            success: true,
            message: 'User berhasil diambil',
            data: user
        });
    });

    static updateUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.updateUser(Number(req.params.id), req.body);
        res.status(200).json({
            success: true,
            message: 'User berhasil diperbarui',
            data: user
        });
    });

    static deleteUser = asyncHandler(async (req: Request, res: Response) => {
        await UserService.deleteUser(Number(req.params.id));
        res.status(200).json({
            success: true,
            message: 'User berhasil dihapus',
        });
    });
}
