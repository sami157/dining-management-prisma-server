import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';

const getAllUsers = async () => {
  return prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateUser = async (id: string, data: any) => {
  await getUserById(id); // throws if missing
  return prisma.user.update({ where: { id }, data });
};

const deactivateUser = async (id: string) => {
  await getUserById(id);
  return prisma.user.update({ where: { id }, data: { isActive: false } });
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
};
