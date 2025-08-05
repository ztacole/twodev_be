import { Request, Response } from 'express';
import * as userService from './user.service';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.getUsers();
  res.json(users);
};
