import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { UserRole } from '../../../generated/prisma/enums';

type UserUpdatePayload = {
  role?: UserRole;
  isActive?: boolean;
  name?: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
};

const getAllUsers = async () => {
  return prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateUser = async (id: string, data: UserUpdatePayload) => {
  await getUserById(id); // throws if missing
  return prisma.user.update({ where: { id }, data });
};

const updateMyProfile = async (id: string, data: Pick<UserUpdatePayload, 'name' | 'mobile' | 'profileImage'>) => {
  await getUserById(id);
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      mobile: data.mobile,
      profileImage: data.profileImage,
    },
  });
};

const updateUserRole = async (id: string, role: UserRole) => {
  await getUserById(id);
  return prisma.user.update({ where: { id }, data: { role } });
};

const deactivateUser = async (id: string) => {
  await getUserById(id);
  return prisma.user.update({ where: { id }, data: { isActive: false } });
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  updateMyProfile,
  updateUserRole,
  deactivateUser,
};
