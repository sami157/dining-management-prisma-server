import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';

export type DepositPayload = {
  userId: string;
  amount: number;
  recordedById: string;
  month: string; // YYYY-MM
  note?: string;
  date?: string;
};

const getAllDeposits = async (userId?: string) => {
  const where = userId ? { userId } : {};

  return prisma.deposit.findMany({
    where,
    orderBy: { date: 'desc' },
  });
};

const createDeposit = async (payload: DepositPayload) => {
  if (payload.amount <= 0) {
    throw new ApiError(400, 'Deposit amount must be greater than 0');
  }

  return prisma.deposit.create({
    data: {
      userId: payload.userId,
      amount: payload.amount,
      recordedById: payload.recordedById,
      month: payload.month,
      note: payload.note,
      date: payload.date ? new Date(payload.date) : new Date(),
    },
  });
};

export const DepositService = {
  getAllDeposits,
  createDeposit,
};
