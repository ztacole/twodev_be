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
        const hasPagingParams = typeof (req.params as any)?.page !== 'undefined' && typeof (req.params as any)?.limit !== 'undefined';
        const hasPagingQuery = typeof req.query.page !== 'undefined' || typeof req.query.limit !== 'undefined';

        if (hasPagingParams || hasPagingQuery) {
            const pageParam = (req.params as any)?.page;
            const limitParam = (req.params as any)?.limit;
            const page = Math.max(1, Number(pageParam ?? req.query.page) || 1);
            const limit = Math.max(1, Math.min(100, Number(limitParam ?? req.query.limit) || 10));
            const result = await UserService.getUsers(page, limit);
            return res.status(200).json({
                success: true,
                message: 'Daftar user berhasil diambil',
                data: result.data,
                meta: result.meta
            });
        }

        const data = await UserService.getAllUsers();
        res.status(200).json({
            success: true,
            message: 'Daftar user berhasil diambil',
            data
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
