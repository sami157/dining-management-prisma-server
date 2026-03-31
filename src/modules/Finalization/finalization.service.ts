import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { UserRole } from '../../../generated/prisma/enums';
import { getMonthDateRangeUtc } from '../../utils/dateTime';

type RequestActor = {
  id: string;
  role: UserRole;
};

const getMemberBreakdownForMonth = async (month: string, userId?: string) => {
  const finalization = await prisma.monthlyFinalization.findUnique({
    where: { month },
  });

  if (!finalization) throw new ApiError(404, 'Monthly finalization not found');

  const { startDate, endDate } = getMonthDateRangeUtc(month);

  const registrations = await prisma.mealRegistration.findMany({
    where: {
      userId,
      scheduledMeal: {
        schedule: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    },
    include: {
      user: true,
      scheduledMeal: true,
    },
  });

  const deposits = await prisma.deposit.findMany({
    where: { month, userId },
  });

  const memberIds = new Set([...registrations.map((r) => r.userId), ...deposits.map((d) => d.userId)]);
  const memberBreakdown = Array.from(memberIds).map((memberId) => {
    const userRegistrations = registrations.filter((registration) => registration.userId === memberId);
    const userDeposits = deposits.filter((deposit) => deposit.userId === memberId);
    const weightedMealCount = userRegistrations.reduce(
      (acc, registration) => acc + Number(registration.count) * Number(registration.scheduledMeal.weight),
      0,
    );
    const totalDeposits = userDeposits.reduce((acc, deposit) => acc + Number(deposit.amount), 0);
    const mealCost = weightedMealCount * Number(finalization.mealRate);

    return {
      user: userRegistrations[0]?.user ?? null,
      weightedMealCount,
      totalDeposits,
      mealCost,
    };
  });

  return {
    finalization,
    memberBreakdown,
  };
};

const getAllFinalizations = async (actor: RequestActor) => {
  const finalizations = await prisma.monthlyFinalization.findMany({ orderBy: { month: 'desc' } });

  if (actor.role !== 'MEMBER') {
    return finalizations;
  }

  const summaries = await Promise.all(
    finalizations.map(async (finalization) => {
      const breakdown = await getMemberBreakdownForMonth(finalization.month, actor.id);
      return {
        finalization,
        summary: breakdown.memberBreakdown[0] ?? {
          user: null,
          weightedMealCount: 0,
          totalDeposits: 0,
          mealCost: 0,
        },
      };
    }),
  );

  return summaries;
};

const getFinalizationByMonth = async (month: string, actor: RequestActor) => {
  return getMemberBreakdownForMonth(month, actor.role === 'MEMBER' ? actor.id : undefined);
};

const finalizeMonth = async (month: string, finalizedById: string) => {
  const existing = await prisma.monthlyFinalization.findUnique({ where: { month } });
  if (existing) throw new ApiError(400, 'Month already finalized');

  const { startDate, endDate } = getMonthDateRangeUtc(month);

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
  getFinalizationByMonth,
  finalizeMonth,
};
