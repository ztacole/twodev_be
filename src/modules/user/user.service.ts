import { prisma } from '../../config/db';
import bcrypt from 'bcryptjs';

export const getUsers = async () => {
  return prisma.user.findMany({
    include: {
      role: true,
      assessee: true,
      assessor: true,
      admin: true
    }
  });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      assessee: true,
      assessor: true,
      admin: true
    }
  });
};

export const createUser = async (userData: {
  email: string;
  password: string;
  role_id: number;
}) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  return prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      role_id: userData.role_id
    },
    include: {
      role: true,
      assessee: true,
      assessor: true,
      admin: true
    }
  });
};

export const updateUser = async (id: number, userData: {
  email?: string;
  password?: string;
  role_id?: number;
}) => {
  const updateData: any = { ...userData };
  
  if (userData.password) {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(userData.password, saltRounds);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      role: true,
      assessee: true,
      assessor: true,
      admin: true
    }
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({
    where: { id }
  });
};

export const createAssessorUser = async (userData: {
  email: string;
  password: string;
  full_name: string;
  scheme_id: number;
  address: string;
  phone_no: string;
  birth_date: Date;
}) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Create user first
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      role_id: 2 // Assessor role
    }
  });

  // Then create assessor record
  const assessor = await prisma.assessor.create({
    data: {
      user_id: user.id,
      full_name: userData.full_name,
      scheme_id: userData.scheme_id,
      address: userData.address,
      phone_no: userData.phone_no,
      birth_date: userData.birth_date
    }
  });

  // Return user with assessor relationship
  return prisma.user.findUnique({
    where: { id: user.id },
    include: {
      role: true,
      assessor: true
    }
  });
};

export const createAssesseeUser = async (userData: {
  email: string;
  password: string;
  full_name: string;
  identity_number: string;
  birth_date: Date;
  birth_location: string;
  gender: string;
  nationality: string;
  phone_no: string;
  house_phone_no?: string;
  office_phone_no?: string;
  address: string;
  postal_code?: string;
  educational_qualifications: string;
}) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Create user first
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      role_id: 3 // Assessee role
    }
  });

  // Then create assessee record
  const assessee = await prisma.assessee.create({
    data: {
      user_id: user.id,
      full_name: userData.full_name,
      identity_number: userData.identity_number,
      birth_date: userData.birth_date,
      birth_location: userData.birth_location,
      gender: userData.gender as any, // The enum type
      nationality: userData.nationality,
      phone_no: userData.phone_no,
      house_phone_no: userData.house_phone_no,
      office_phone_no: userData.office_phone_no,
      address: userData.address,
      postal_code: userData.postal_code,
      educational_qualifications: userData.educational_qualifications
    }
  });

  // Return user with assessee relationship
  return prisma.user.findUnique({
    where: { id: user.id },
    include: {
      role: true,
      assessee: true
    }
  });
};
