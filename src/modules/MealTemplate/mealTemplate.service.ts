import { prisma } from '../../lib/prisma';
import { DayOfWeek, MealType } from '../../../generated/prisma/enums';

const getTemplate = async () => {
  return prisma.weeklyMealTemplate.findMany({ orderBy: { dayOfWeek: 'asc' } });
};

const upsertTemplate = async (dayOfWeek: DayOfWeek, meals: MealType[], updatedById: string) => {
  return prisma.weeklyMealTemplate.upsert({
    where: { dayOfWeek },
    create: { dayOfWeek, meals, updatedById },
    update: { meals, updatedById },
  });
};

export const MealTemplateService = {
  getTemplate,
  upsertTemplate,
};
