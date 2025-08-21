import { Request, Response } from 'express';
import { UserService } from './user.service';
import { asyncHandler } from '../../common/async.handler';

export class UserController {
    static getUsers = asyncHandler(async (req: Request, res: Response) => {
        const users = await UserService.getUsers();
        res.json({ success: true, message: 'Users fetched', data: users });
    });

    static getUserById = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.getUserById(Number(req.params.id));
        res.json({ success: true, message: 'User fetched', data: user });
    });

    static createUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.createUser(req.body);
        res.status(201).json({ success: true, message: 'User created', data: user });
    });

    static createAssessorUser = asyncHandler(async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await UserService.createUserWithAssessor(payload);
        res.status(201).json({ success: true, message: 'Assessor user created', data: result });
    });

    static createAssesseeUser = asyncHandler(async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await UserService.createUserWithAssessee(payload);
        res.status(201).json({ success: true, message: 'Assessee user created', data: result });
    });

    static updateUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.updateUser(Number(req.params.id), req.body);
        res.json({ success: true, message: 'User updated', data: user });
    });

    static deleteUser = asyncHandler(async (req: Request, res: Response) => {
        await UserService.deleteUser(Number(req.params.id));
        res.json({ success: true, message: 'User deleted' });
    });
}
