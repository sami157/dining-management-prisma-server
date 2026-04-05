import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { UserRole } from '../../../generated/prisma/enums';
import { getMonthDateRangeUtc } from '../../utils/dateTime';
type RequestActor = {
  id: string;
  role: UserRole;
};

const roundCurrency = (value: number) => Number(value.toFixed(2));
const roundMealRate = (value: number) => Number(value.toFixed(4));

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
  const { startDate, endDate } = getMonthDateRangeUtc(month);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.monthlyFinalization.findUnique({ where: { month } });
    if (existing?.isLocked) throw new ApiError(400, 'Month already finalized');

    const expenses = await tx.expense.findMany({ where: { month } });
    if (!expenses.length) throw new ApiError(400, 'At least one expense is required to finalize');

    const registrations = await tx.mealRegistration.findMany({
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

    const totalExpenses = roundCurrency(expenses.reduce((acc, e) => acc + Number(e.amount), 0));
    const totalWeightedMealCount = Number(
      registrations.reduce((acc, r) => acc + Number(r.count) * Number(r.scheduledMeal.weight), 0).toFixed(2),
    );

    if (totalWeightedMealCount <= 0) throw new ApiError(400, 'Total weighted meal count must be greater than 0');

    const mealRate = roundMealRate(totalExpenses / totalWeightedMealCount);
    const users = await tx.user.findMany({ where: { isActive: true } });
    const deposits = await tx.deposit.findMany({ where: { month } });

    if (existing) {
      await tx.monthlyMemberSettlement.deleteMany({
        where: { finalizationId: existing.id },
      });
    }

    const finalization = existing
      ? await tx.monthlyFinalization.update({
          where: { id: existing.id },
          data: {
            totalExpenses,
            totalWeightedMealCount,
            mealRate,
            finalizedById,
            finalizedAt: new Date(),
            isLocked: true,
            rolledBackAt: null,
            rolledBackById: null,
          },
        })
      : await tx.monthlyFinalization.create({
          data: {
            month,
            totalExpenses,
            totalWeightedMealCount,
            mealRate,
            finalizedById,
            isLocked: true,
          },
        });

    for (const user of users) {
      const userRegistrations = registrations.filter((r) => r.userId === user.id);
      const userWeightedCount = Number(
        userRegistrations
          .reduce((acc, r) => acc + Number(r.count) * Number(r.scheduledMeal.weight), 0)
          .toFixed(2),
      );
      const userDepositTotal = roundCurrency(
        deposits.filter((deposit) => deposit.userId === user.id).reduce((acc, d) => acc + Number(d.amount), 0),
      );
      const openingBalance = roundCurrency(Number(user.balance));
      const mealCost = roundCurrency(userWeightedCount * mealRate);
      const appliedBalanceDelta = roundCurrency(-mealCost);
      const closingBalance = roundCurrency(openingBalance + appliedBalanceDelta);

      await tx.user.update({ where: { id: user.id }, data: { balance: closingBalance } });
      await tx.monthlyMemberSettlement.create({
        data: {
          month,
          finalizationId: finalization.id,
          userId: user.id,
          openingBalance,
          depositTotal: userDepositTotal,
          weightedMealCount: userWeightedCount,
          mealCost,
          appliedBalanceDelta,
          closingBalance,
        },
      });
    }

    return finalization;
  });
};

const rollbackMonth = async (month: string, rolledBackById: string) => {
  return prisma.$transaction(async (tx) => {
    const finalization = await tx.monthlyFinalization.findUnique({ where: { month } });

    if (!finalization) throw new ApiError(404, 'Monthly finalization not found');
    if (!finalization.isLocked) throw new ApiError(400, 'Month is not currently finalized');

    const settlements = await tx.monthlyMemberSettlement.findMany({
      where: { finalizationId: finalization.id },
      select: {
        userId: true,
        appliedBalanceDelta: true,
      },
    });

    if (!settlements.length) {
      throw new ApiError(400, 'Rollback data is unavailable for this month');
    }

    for (const settlement of settlements) {
      const reversalAmount = roundCurrency(-Number(settlement.appliedBalanceDelta));

      if (reversalAmount !== 0) {
        await tx.user.update({
          where: { id: settlement.userId },
          data: { balance: { increment: reversalAmount } },
        });
      }
    }

    return tx.monthlyFinalization.update({
      where: { id: finalization.id },
      data: {
        isLocked: false,
        rolledBackAt: new Date(),
        rolledBackById,
      },
    });
  });
};

export const FinalizationService = {
  getAllFinalizations,
  getFinalizationByMonth,
  finalizeMonth,
  rollbackMonth,
};
