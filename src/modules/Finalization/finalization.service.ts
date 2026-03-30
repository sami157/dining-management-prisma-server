import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';

const getAllFinalizations = async () => {
  return prisma.monthlyFinalization.findMany({ orderBy: { month: 'desc' } });
};

const finalizeMonth = async (month: string, finalizedById: string) => {
  const existing = await prisma.monthlyFinalization.findUnique({ where: { month } });
  if (existing) throw new ApiError(400, 'Month already finalized');

  const startDate = new Date(`${month}-01T00:00:00.000Z`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const expenses = await prisma.expense.findMany({ where: { month } });
  if (!expenses.length) throw new ApiError(400, 'At least one expense is required to finalize');

  const registrations = await prisma.mealRegistration.findMany({
    where: {
      scheduledMeal: {
        schedule: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    },
    include: { scheduledMeal: true },
  });

  if (!registrations.length) throw new ApiError(400, 'At least one meal registration is required to finalize');

  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const totalWeightedMealCount = registrations.reduce((acc, r) => acc + Number(r.count) * Number(r.scheduledMeal.weight), 0);

  if (totalWeightedMealCount <= 0) throw new ApiError(400, 'Total weighted meal count must be greater than 0');

  const mealRate = totalExpenses / totalWeightedMealCount;

  const users = await prisma.user.findMany({ where: { isActive: true } });

  for (const user of users) {
    const userRegistrations = registrations.filter((r) => r.userId === user.id);
    const userWeightedCount = userRegistrations.reduce((acc, r) => acc + Number(r.count) * Number(r.scheduledMeal.weight), 0);
    const userDeposits = await prisma.deposit.findMany({ where: { userId: user.id, month } });
    const userDepositTotal = userDeposits.reduce((acc, d) => acc + Number(d.amount), 0);
    const mealCost = userWeightedCount * mealRate;
    const newBalance = Number(user.balance) + userDepositTotal - mealCost;

    await prisma.user.update({ where: { id: user.id }, data: { balance: newBalance } });
  }

  const finalization = await prisma.monthlyFinalization.create({
    data: {
      month,
      totalExpenses,
      totalWeightedMealCount,
      mealRate,
      finalizedById,
      isLocked: true,
    },
  });

  return finalization;
};

export const FinalizationService = {
  getAllFinalizations,
  finalizeMonth,
};
