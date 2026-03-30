import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';

export type MealDefinition = {
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  isAvailable?: boolean;
  weight?: number;
  menu?: string;
};

const getAllSchedules = async () => {
  return prisma.mealSchedule.findMany({
    orderBy: { date: 'asc' },
    include: { meals: true },
  });
};

const createSchedule = async (date: string, createdById: string, meals: MealDefinition[]) => {
  const scheduleExists = await prisma.mealSchedule.findUnique({ where: { date: new Date(date) } });
  if (scheduleExists) throw new ApiError(400, 'Meal schedule for this date already exists');

  const parsedDate = new Date(date);
  return prisma.mealSchedule.create({
    data: {
      date: parsedDate,
      createdById,
      meals: {
        create: meals.map((m) => ({
          type: m.type,
          isAvailable: m.isAvailable ?? true,
          weight: m.weight ?? 1.0,
          menu: m.menu,
        })),
      },
    },
    include: { meals: true },
  });
};

const deleteSchedule = async (id: string) => {
  const existing = await prisma.mealSchedule.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Meal schedule not found');
  return prisma.mealSchedule.delete({ where: { id } });
};

export const MealScheduleService = {
  getAllSchedules,
  createSchedule,
  deleteSchedule,
};
