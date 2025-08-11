import { Request, Response } from 'express';
import * as userService from './user.service';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      data: null
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(parseInt(id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      data: null
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role_id } = req.body;

    if (!email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role_id are required',
        data: null
      });
    }

    const user = await userService.createUser({ email, password, role_id });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user',
      data: null
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, role_id } = req.body;

    const user = await userService.updateUser(parseInt(id), { email, password, role_id });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user',
      data: null
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(parseInt(id));
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: null
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user',
      data: null
    });
  }
};

export const createAssessorUser = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, scheme_id, address, phone_no, birth_date } = req.body;

    if (!email || !password || !full_name || !scheme_id || !address || !phone_no || !birth_date) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        data: null
      });
    }

    const user = await userService.createAssessorUser({
      email,
      password,
      full_name,
      scheme_id: parseInt(scheme_id),
      address,
      phone_no,
      birth_date: new Date(birth_date)
    });
    
    res.status(201).json({
      success: true,
      message: 'Assessor user created successfully',
      data: user
    });
  } catch (error: any) {
    console.error('Error creating assessor user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create assessor user',
      data: null
    });
  }
};

export const createAssesseeUser = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      full_name, 
      identity_number, 
      birth_date, 
      birth_location, 
      gender, 
      nationality, 
      phone_no, 
      house_phone_no, 
      office_phone_no, 
      address, 
      postal_code, 
      educational_qualifications 
    } = req.body;

    if (!email || !password || !full_name || !identity_number || !birth_date || !birth_location || !gender || !nationality || !phone_no || !address || !educational_qualifications) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        data: null
      });
    }

    const user = await userService.createAssesseeUser({
      email,
      password,
      full_name,
      identity_number,
      birth_date: new Date(birth_date),
      birth_location,
      gender,
      nationality,
      phone_no,
      house_phone_no,
      office_phone_no,
      address,
      postal_code,
      educational_qualifications
    });
    
    res.status(201).json({
      success: true,
      message: 'Assessee user created successfully',
      data: user
    });
  } catch (error: any) {
    console.error('Error creating assessee user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create assessee user',
      data: null
    });
  }
};
