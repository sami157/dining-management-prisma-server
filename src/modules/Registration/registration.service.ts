import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';

export type RegistrationPayload = {
  scheduledMealId: string;
  userId: string;
  count: number;
  registeredById: string;
};

const getAllRegistrations = async (userId?: string) => {
  const where = userId ? { userId } : {};
  return prisma.mealRegistration.findMany({ where, include: { scheduledMeal: true, user: true } });
};

const upsertRegistration = async ({ scheduledMealId, userId, count, registeredById }: RegistrationPayload) => {
  const scheduledMeal = await prisma.scheduledMeal.findUnique({ where: { id: scheduledMealId } });
  if (!scheduledMeal) throw new ApiError(404, 'Scheduled meal not found');
  if (!scheduledMeal.isAvailable) throw new ApiError(400, 'Scheduled meal is not available');

  return prisma.mealRegistration.upsert({
    where: { scheduledMealId_userId: { scheduledMealId, userId } },
    create: {
      scheduledMealId,
      userId,
      count,
      registeredById,
    },
    update: {
      count,
      registeredById,
    },
    include: {
      scheduledMeal: true,
      user: true,
    },
  });
};

const deleteRegistration = async (id: string) => {
  const existing = await prisma.mealRegistration.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Meal registration not found');
  return prisma.mealRegistration.delete({ where: { id } });
};

export const RegistrationService = {
  getAllRegistrations,
  upsertRegistration,
  deleteRegistration,
};
