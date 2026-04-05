import { prisma } from '../../lib/prisma';
import { getCurrentDhakaDateString, getMonthDateRangeUtc } from '../../utils/dateTime';

type PublicRankedMember = {
  userId: string;
  name: string;
  totalAmount: number;
} | null;

type PublicTopConsumer = {
  userId: string;
  name: string;
  totalMealsRegistered: number;
  totalWeightedMeals: number;
} | null;

const getDailyStats = async (date: string) => {
  const scheduleDate = new Date(`${date}T00:00:00.000Z`);
  const schedule = await prisma.mealSchedule.findFirst({
    where: { date: scheduleDate },
    include: {
      meals: {
        include: {
          registrations: true,
        },
      },
    },
  });

  if (!schedule) {
    return {
      date,
      hasSchedule: false,
      meals: {
        availableMealCount: 0,
        totalRegistrations: 0,
        totalMealsRegistered: 0,
        totalWeightedMeals: 0,
        byType: [],
      },
    };
  }

  const byType = schedule.meals.map((meal) => {
    const totalRegistrations = meal.registrations.length;
    const totalMealsRegistered = meal.registrations.reduce((acc, registration) => acc + registration.count, 0);
    const totalWeightedMeals = Number((totalMealsRegistered * Number(meal.weight)).toFixed(2));

    return {
      type: meal.type,
      isAvailable: meal.isAvailable,
      weight: Number(meal.weight),
      totalRegistrations,
      totalMealsRegistered,
      totalWeightedMeals,
    };
  });

  return {
    date,
    hasSchedule: true,
    meals: {
      availableMealCount: schedule.meals.filter((meal) => meal.isAvailable).length,
      totalRegistrations: byType.reduce((acc, meal) => acc + meal.totalRegistrations, 0),
      totalMealsRegistered: byType.reduce((acc, meal) => acc + meal.totalMealsRegistered, 0),
      totalWeightedMeals: Number(byType.reduce((acc, meal) => acc + meal.totalWeightedMeals, 0).toFixed(2)),
      byType,
    },
  };
};

const getOverviewStats = async () => {
  const currentMonth = getCurrentDhakaDateString().slice(0, 7);

  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalMembers,
    totalManagers,
    totalAdmins,
    activeMembers,
    finalizedMonthCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.user.count({ where: { role: 'MANAGER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'MEMBER', isActive: true } }),
    prisma.monthlyFinalization.count({ where: { isLocked: true } }),
  ]);

  return {
    asOfDate: getCurrentDhakaDateString(),
    currentMonth,
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    roles: {
      admins: totalAdmins,
      managers: totalManagers,
      members: totalMembers,
      activeMembers,
    },
    finalization: {
      lockedMonths: finalizedMonthCount,
    },
  };
};

const getPublicStats = async (month?: string) => {
  const targetMonth = month ?? getCurrentDhakaDateString().slice(0, 7);
  const { startDate, endDate } = getMonthDateRangeUtc(targetMonth);

  const [
    activeMembers,
    activeManagers,
    registrations,
    scheduleCount,
    finalization,
    deposits,
    expensesAggregate,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'MEMBER', isActive: true } }),
    prisma.user.count({ where: { role: 'MANAGER', isActive: true } }),
    prisma.mealRegistration.findMany({
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
      include: {
        scheduledMeal: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.mealSchedule.count({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    }),
    prisma.monthlyFinalization.findFirst({
      where: { month: targetMonth },
      select: {
        isLocked: true,
        finalizedAt: true,
        mealRate: true,
      },
    }),
    prisma.deposit.findMany({
      where: { month: targetMonth },
      select: {
        userId: true,
        amount: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.expense.aggregate({
      where: { month: targetMonth },
      _sum: { amount: true },
    }),
  ]);

  const totalMealsRegistered = registrations.reduce((acc, registration) => acc + registration.count, 0);
  const totalWeightedMeals = Number(
    registrations
      .reduce((acc, registration) => acc + registration.count * Number(registration.scheduledMeal.weight), 0)
      .toFixed(2),
  );
  const totalDeposits = Number(
    deposits.reduce((acc, deposit) => acc + Number(deposit.amount), 0).toFixed(2),
  );
  const totalExpenses = Number(expensesAggregate._sum.amount ?? 0);

  const depositorMap = new Map<string, { userId: string; name: string; totalAmount: number }>();
  for (const deposit of deposits) {
    const existing = depositorMap.get(deposit.userId);
    const nextTotal = Number(((existing?.totalAmount ?? 0) + Number(deposit.amount)).toFixed(2));

    depositorMap.set(deposit.userId, {
      userId: deposit.userId,
      name: deposit.user.name,
      totalAmount: nextTotal,
    });
  }

  const topDepositor: PublicRankedMember = [...depositorMap.values()].sort((a, b) => {
    if (b.totalAmount !== a.totalAmount) return b.totalAmount - a.totalAmount;
    return a.name.localeCompare(b.name);
  })[0] ?? null;

  const consumerMap = new Map<
    string,
    { userId: string; name: string; totalMealsRegistered: number; totalWeightedMeals: number }
  >();

  for (const registration of registrations) {
    const existing = consumerMap.get(registration.userId);
    const weightedMeals = Number((registration.count * Number(registration.scheduledMeal.weight)).toFixed(2));

    consumerMap.set(registration.userId, {
      userId: registration.userId,
      name: registration.user.name,
      totalMealsRegistered: (existing?.totalMealsRegistered ?? 0) + registration.count,
      totalWeightedMeals: Number(((existing?.totalWeightedMeals ?? 0) + weightedMeals).toFixed(2)),
    });
  }

  const topConsumer: PublicTopConsumer = [...consumerMap.values()].sort((a, b) => {
    if (b.totalWeightedMeals !== a.totalWeightedMeals) return b.totalWeightedMeals - a.totalWeightedMeals;
    if (b.totalMealsRegistered !== a.totalMealsRegistered) return b.totalMealsRegistered - a.totalMealsRegistered;
    return a.name.localeCompare(b.name);
  })[0] ?? null;

  return {
    asOfDate: getCurrentDhakaDateString(),
    month: targetMonth,
    community: {
      activeMembers,
      activeManagers,
    },
    meals: {
      totalRegistrations: registrations.length,
      totalMealsRegistered,
      totalWeightedMeals,
      scheduleCount,
    },
    finance: {
      totalDeposits,
      totalExpenses,
    },
    highlights: {
      topDepositor,
      topConsumer,
    },
    finalization: {
      isFinalized: Boolean(finalization?.isLocked),
      finalizedAt: finalization?.finalizedAt ?? null,
      rolledBackAt: null,
      mealRate: finalization ? Number(finalization.mealRate) : null,
    },
  };
};

const getManagers = async () => {
  return prisma.user.findMany({
    where: { role: 'MANAGER', isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      profileImage: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getMonthlyStats = async (month: string) => {
  const { startDate, endDate } = getMonthDateRangeUtc(month);

  const [
    depositsAggregate,
    expensesAggregate,
    totalExpensesCount,
    depositCount,
    registrations,
    scheduleCount,
    availableMealCount,
    finalization,
  ] = await Promise.all([
    prisma.deposit.aggregate({
      where: { month },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { month },
      _sum: { amount: true },
    }),
    prisma.expense.count({ where: { month } }),
    prisma.deposit.count({ where: { month } }),
    prisma.mealRegistration.findMany({
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
      include: {
        scheduledMeal: true,
      },
    }),
    prisma.mealSchedule.count({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    }),
    prisma.scheduledMeal.count({
      where: {
        isAvailable: true,
        schedule: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    }),
    prisma.monthlyFinalization.findFirst({
      where: { month },
      select: {
        id: true,
        finalizedAt: true,
        isLocked: true,
        mealRate: true,
        totalExpenses: true,
        totalWeightedMealCount: true,
      },
    }),
  ]);

  const totalMealsRegistered = registrations.reduce((acc, registration) => acc + registration.count, 0);
  const totalWeightedMeals = Number(
    registrations
      .reduce((acc, registration) => acc + registration.count * Number(registration.scheduledMeal.weight), 0)
      .toFixed(2),
  );
  const uniqueMembersWithRegistrations = new Set(registrations.map((registration) => registration.userId)).size;
  const uniqueDepositors = await prisma.deposit.groupBy({
    by: ['userId'],
    where: { month },
  });

  return {
    month,
    deposits: {
      totalAmount: Number(depositsAggregate._sum.amount ?? 0),
      count: depositCount,
      uniqueDepositors: uniqueDepositors.length,
    },
    expenses: {
      totalAmount: Number(expensesAggregate._sum.amount ?? 0),
      count: totalExpensesCount,
    },
    meals: {
      totalRegistrations: registrations.length,
      totalMealsRegistered,
      totalWeightedMeals,
      uniqueMembersWithRegistrations,
      scheduleCount,
      availableMealCount,
    },
    finalization: finalization
        ? {
          isFinalized: finalization.isLocked,
          finalizedAt: finalization.finalizedAt,
          rolledBackAt: null,
          mealRate: Number(finalization.mealRate),
          totalExpenses: Number(finalization.totalExpenses),
          totalWeightedMealCount: Number(finalization.totalWeightedMealCount),
        }
      : {
          isFinalized: false,
          finalizedAt: null,
          rolledBackAt: null,
          mealRate: null,
          totalExpenses: null,
          totalWeightedMealCount: null,
        },
  };
};

export const StatsService = {
  getDailyStats,
  getOverviewStats,
  getPublicStats,
  getManagers,
  getMonthlyStats,
};
