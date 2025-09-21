import { Request, Response } from 'express';
import { RoleService } from "./role.service";

export class RoleController {
    static getRoles(req: Request, res: Response) {
        const roles = RoleService.getRoles();

        res.json({
            success: true,
            message: 'Data role berhasil diambil',
            data: roles,
        });
    }
}