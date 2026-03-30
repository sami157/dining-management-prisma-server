import { prisma } from '../../lib/prisma';

const getTemplate = async () => {
  return prisma.weeklyMealTemplate.findMany({ orderBy: { dayOfWeek: 'asc' } });
};

const upsertTemplate = async (dayOfWeek: string, meals: Array<'BREAKFAST'|'LUNCH'|'DINNER'>, updatedById: string) => {
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
