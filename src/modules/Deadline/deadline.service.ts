import { prisma } from '../../lib/prisma';

export type DeadlineUpsertPayload = {
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  time: string;
  offsetDays: number;
  updatedById: string;
};

const getAllDeadlines = async () => {
  return prisma.mealDeadline.findMany({
    orderBy: {
      type: 'asc',
    },
  });
};

const upsertDeadline = async (payload: DeadlineUpsertPayload) => {
  const { type, time, offsetDays, updatedById } = payload;

  return prisma.mealDeadline.upsert({
    where: { type },
    create: {
      type,
      time,
      offsetDays,
      updatedById,
    },
    update: {
      time,
      offsetDays,
      updatedById,
    },
  });
};

export const DeadlineService = {
  getAllDeadlines,
  upsertDeadline,
};
