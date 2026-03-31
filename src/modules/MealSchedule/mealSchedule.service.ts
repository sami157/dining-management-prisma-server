import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { DayOfWeek, MealType } from '../../../generated/prisma/enums';
import { getMonthDateRangeUtc, getMonthStringFromUtcDate, toUtcDateAtStartOfDay } from '../../utils/dateTime';
import { assertDateNotFinalized, assertMonthNotFinalized } from '../../utils/finalizationLock';

export type MealDefinition = {
  type: MealType;
  isAvailable?: boolean;
  weight?: number;
  menu?: string;
};

const getDayOfWeekFromDate = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  return days[date.getUTCDay()];
};

const getAllSchedules = async (filters?: { date?: string; month?: string }) => {
  const where =
    filters?.date
      ? { date: new Date(`${filters.date}T00:00:00.000Z`) }
      : filters?.month
        ? { date: { gte: getMonthDateRangeUtc(filters.month).startDate, lt: getMonthDateRangeUtc(filters.month).endDate } }
        : {};

  return prisma.mealSchedule.findMany({
    where,
    orderBy: { date: 'asc' },
    include: { meals: true },
  });
};

const getScheduleById = async (id: string) => {
  const schedule = await prisma.mealSchedule.findUnique({
    where: { id },
    include: { meals: true },
  });

  if (!schedule) throw new ApiError(404, 'Meal schedule not found');
  return schedule;
};

const createSchedule = async (date: string, createdById: string, meals: MealDefinition[]) => {
  const scheduleDate = toUtcDateAtStartOfDay(date);
  await assertDateNotFinalized(scheduleDate);
  const scheduleExists = await prisma.mealSchedule.findUnique({ where: { date: scheduleDate } });
  if (scheduleExists) throw new ApiError(400, 'Meal schedule for this date already exists');

  return prisma.mealSchedule.create({
    data: {
      date: scheduleDate,
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

const generateSchedules = async (month: string, createdById: string) => {
  await assertMonthNotFinalized(month);
  const templates = await prisma.weeklyMealTemplate.findMany();
  if (!templates.length) throw new ApiError(400, 'Weekly meal template is not configured');

  const templateMap = new Map<DayOfWeek, MealType[]>(
    templates.map((template) => [template.dayOfWeek, template.meals]),
  );

  const { startDate, endDate } = getMonthDateRangeUtc(month);
  const existingSchedules = await prisma.mealSchedule.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: { date: true },
  });

  const existingDateSet = new Set(existingSchedules.map((schedule) => schedule.date.toISOString().slice(0, 10)));
  const createdSchedules = [];

  for (let date = new Date(startDate); date < endDate; date.setUTCDate(date.getUTCDate() + 1)) {
    const currentDate = new Date(date);
    const dateKey = currentDate.toISOString().slice(0, 10);
    if (existingDateSet.has(dateKey)) continue;

    const mealsForDay = templateMap.get(getDayOfWeekFromDate(currentDate)) ?? [];
    if (!mealsForDay.length) continue;

    const schedule = await prisma.mealSchedule.create({
      data: {
        date: currentDate,
        createdById,
        meals: {
          create: mealsForDay.map((mealType) => ({
            type: mealType,
            isAvailable: true,
            weight: 1,
          })),
        },
      },
      include: { meals: true },
    });

    createdSchedules.push(schedule);
  }

  return createdSchedules;
};

const getDailyRegistrationSummary = async (date: string) => {
  const scheduleDate = new Date(`${date}T00:00:00.000Z`);
  const schedule = await prisma.mealSchedule.findUnique({
    where: { date: scheduleDate },
    include: {
      meals: {
        include: {
          registrations: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!schedule) throw new ApiError(404, 'Meal schedule not found for this date');
  return schedule;
};

const addMealToSchedule = async (scheduleId: string, meal: MealDefinition) => {
  const schedule = await getScheduleById(scheduleId);
  await assertDateNotFinalized(schedule.date);

  const existingMeal = await prisma.scheduledMeal.findUnique({
    where: { scheduleId_type: { scheduleId, type: meal.type } },
  });

  if (existingMeal) throw new ApiError(400, 'Meal already exists for this schedule');

  return prisma.scheduledMeal.create({
    data: {
      scheduleId,
      type: meal.type,
      isAvailable: meal.isAvailable ?? true,
      weight: meal.weight ?? 1,
      menu: meal.menu,
    },
  });
};

const updateScheduledMeal = async (
  scheduleId: string,
  mealType: MealType,
  payload: Omit<MealDefinition, 'type'>,
) => {
  const schedule = await getScheduleById(scheduleId);
  await assertDateNotFinalized(schedule.date);

  const existingMeal = await prisma.scheduledMeal.findUnique({
    where: { scheduleId_type: { scheduleId, type: mealType } },
  });

  if (!existingMeal) throw new ApiError(404, 'Scheduled meal not found');

  return prisma.scheduledMeal.update({
    where: { scheduleId_type: { scheduleId, type: mealType } },
    data: {
      isAvailable: payload.isAvailable,
      weight: payload.weight,
      menu: payload.menu,
    },
  });
};

const deleteScheduledMeal = async (scheduleId: string, mealType: MealType) => {
  const schedule = await getScheduleById(scheduleId);
  await assertDateNotFinalized(schedule.date);

  const existingMeal = await prisma.scheduledMeal.findUnique({
    where: { scheduleId_type: { scheduleId, type: mealType } },
  });

  if (!existingMeal) throw new ApiError(404, 'Scheduled meal not found');

  return prisma.scheduledMeal.delete({
    where: { scheduleId_type: { scheduleId, type: mealType } },
  });
};

const deleteSchedule = async (id: string) => {
  const existing = await prisma.mealSchedule.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Meal schedule not found');
  await assertMonthNotFinalized(getMonthStringFromUtcDate(existing.date));
  return prisma.mealSchedule.delete({ where: { id } });
};

export const MealScheduleService = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  generateSchedules,
  getDailyRegistrationSummary,
  addMealToSchedule,
  updateScheduledMeal,
  deleteScheduledMeal,
  deleteSchedule,
};
