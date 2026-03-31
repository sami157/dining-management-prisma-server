import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { getCurrentDhakaDateString, toUtcDateAtStartOfDay } from '../../utils/dateTime';
import { assertMonthNotFinalized } from '../../utils/finalizationLock';

export type DepositPayload = {
  userId: string;
  amount: number;
  recordedById: string;
  month: string; // YYYY-MM
  note?: string;
  date?: string;
};

export type UpdateDepositPayload = Partial<DepositPayload>;

const getAllDeposits = async (userId?: string) => {
  const where = userId ? { userId } : {};

  return prisma.deposit.findMany({
    where,
    orderBy: { date: 'desc' },
  });
};

const getMonthlyTotalByUser = async (userId: string, month: string) => {
  const aggregate = await prisma.deposit.aggregate({
    where: { userId, month },
    _sum: { amount: true },
  });

  return {
    userId,
    month,
    totalDeposit: Number(aggregate._sum.amount ?? 0),
  };
};

const createDeposit = async (payload: DepositPayload) => {
  if (payload.amount <= 0) {
    throw new ApiError(400, 'Deposit amount must be greater than 0');
  }

  await assertMonthNotFinalized(payload.month);

  return prisma.deposit.create({
    data: {
      userId: payload.userId,
      amount: payload.amount,
      recordedById: payload.recordedById,
      month: payload.month,
      note: payload.note,
      date: payload.date
        ? toUtcDateAtStartOfDay(payload.date)
        : toUtcDateAtStartOfDay(getCurrentDhakaDateString()),
    },
  });
};

const updateDeposit = async (id: string, payload: UpdateDepositPayload) => {
  const existing = await prisma.deposit.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Deposit not found');
  await assertMonthNotFinalized(existing.month);

  if (payload.month && payload.month !== existing.month) {
    await assertMonthNotFinalized(payload.month);
  }

  if (payload.amount !== undefined && payload.amount <= 0) {
    throw new ApiError(400, 'Deposit amount must be greater than 0');
  }

  return prisma.deposit.update({
    where: { id },
    data: {
      userId: payload.userId,
      amount: payload.amount,
      recordedById: payload.recordedById,
      month: payload.month,
      note: payload.note,
      date: payload.date ? toUtcDateAtStartOfDay(payload.date) : undefined,
    },
  });
};

const deleteDeposit = async (id: string) => {
  const existing = await prisma.deposit.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Deposit not found');
  await assertMonthNotFinalized(existing.month);

  return prisma.deposit.delete({ where: { id } });
};

export const DepositService = {
  getAllDeposits,
  getMonthlyTotalByUser,
  createDeposit,
  updateDeposit,
  deleteDeposit,
};
