import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { UserRole } from '../../../generated/prisma/enums';
import { getMealDeadlineUtc, getMonthStringFromUtcDate } from '../../utils/dateTime';
import { assertMonthNotFinalized } from '../../utils/finalizationLock';

export type RegistrationPayload = {
  scheduledMealId: string;
  userId: string;
  count: number;
  registeredById: string;
};

type RequestActor = {
  id: string;
  role: UserRole;
};

const assertRegistrationAllowed = async (
  scheduledMealId: string,
  targetUserId: string,
  actor: RequestActor,
) => {
  const scheduledMeal = await prisma.scheduledMeal.findUnique({
    where: { id: scheduledMealId },
    include: { schedule: true },
  });

  if (!scheduledMeal) throw new ApiError(404, 'Scheduled meal not found');
  await assertMonthNotFinalized(getMonthStringFromUtcDate(scheduledMeal.schedule.date));

  if (actor.role === 'MEMBER') {
    if (targetUserId !== actor.id) {
      throw new ApiError(403, 'Members can only manage their own registrations');
    }

    const deadline = await prisma.mealDeadline.findUnique({ where: { type: scheduledMeal.type } });
    if (!deadline) {
      throw new ApiError(400, 'Meal deadline is not configured');
    }

    const deadlineUtc = getMealDeadlineUtc(scheduledMeal.schedule.date, deadline.time, deadline.offsetDays);
    if (Date.now() > deadlineUtc.getTime()) {
      throw new ApiError(400, 'Registration deadline has passed for this meal');
    }
  }

  return scheduledMeal;
};

const getAllRegistrations = async (userId?: string) => {
  const where = userId ? { userId } : {};
  return prisma.mealRegistration.findMany({ where, include: { scheduledMeal: true, user: true } });
};

const upsertRegistration = async (
  { scheduledMealId, userId, count, registeredById }: RegistrationPayload,
  actor: RequestActor,
) => {
  const scheduledMeal = await assertRegistrationAllowed(scheduledMealId, userId, actor);
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

const updateRegistration = async (id: string, count: number, registeredById: string, actor: RequestActor) => {
  const existing = await prisma.mealRegistration.findUnique({
    where: { id },
    include: {
      scheduledMeal: {
        include: {
          schedule: true,
        },
      },
    },
  });
  if (!existing) throw new ApiError(404, 'Meal registration not found');

  await assertMonthNotFinalized(getMonthStringFromUtcDate(existing.scheduledMeal.schedule.date));

  if (actor.role === 'MEMBER') {
    if (existing.userId !== actor.id) {
      throw new ApiError(403, 'Members can only update their own registrations');
    }

    const deadline = await prisma.mealDeadline.findUnique({ where: { type: existing.scheduledMeal.type } });
    if (!deadline) {
      throw new ApiError(400, 'Meal deadline is not configured');
    }

    const deadlineUtc = getMealDeadlineUtc(existing.scheduledMeal.schedule.date, deadline.time, deadline.offsetDays);
    if (Date.now() > deadlineUtc.getTime()) {
      throw new ApiError(400, 'Registration deadline has passed for this meal');
    }
  }

  return prisma.mealRegistration.update({
    where: { id },
    data: {
      count,
      registeredById,
    },
    include: {
      scheduledMeal: true,
      user: true,
    },
  });
};

const deleteRegistration = async (id: string, actor: RequestActor) => {
  const existing = await prisma.mealRegistration.findUnique({
    where: { id },
    include: {
      scheduledMeal: {
        include: {
          schedule: true,
        },
      },
    },
  });
  if (!existing) throw new ApiError(404, 'Meal registration not found');

  await assertMonthNotFinalized(getMonthStringFromUtcDate(existing.scheduledMeal.schedule.date));

  if (actor.role === 'MEMBER') {
    if (existing.userId !== actor.id) {
      throw new ApiError(403, 'Members can only delete their own registrations');
    }

    const deadline = await prisma.mealDeadline.findUnique({ where: { type: existing.scheduledMeal.type } });
    if (!deadline) {
      throw new ApiError(400, 'Meal deadline is not configured');
    }

    const deadlineUtc = getMealDeadlineUtc(existing.scheduledMeal.schedule.date, deadline.time, deadline.offsetDays);
    if (Date.now() > deadlineUtc.getTime()) {
      throw new ApiError(400, 'Cancellation deadline has passed for this meal');
    }
  }

  return prisma.mealRegistration.delete({ where: { id } });
};

export const RegistrationService = {
  getAllRegistrations,
  upsertRegistration,
  updateRegistration,
  deleteRegistration,
};
