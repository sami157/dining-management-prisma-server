import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { getCurrentDhakaDateString, toUtcDateAtStartOfDay } from '../../utils/dateTime';
import { assertMonthNotFinalized } from '../../utils/finalizationLock';

export type ExpensePayload = {
  date?: string;
  amount: number;
  category: 'GAS' | 'TRANSPORT' | 'BAZAR' | 'OTHER';
  personName: string;
  description?: string;
  loggedById: string;
  month: string;
};

export type UpdateExpensePayload = Partial<ExpensePayload>;

const getAllExpenses = async (month?: string) => {
  const where = month ? { month } : {};
  return prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
};

const createExpense = async (payload: ExpensePayload) => {
  await assertMonthNotFinalized(payload.month);

  return prisma.expense.create({
    data: {
      date: payload.date
        ? toUtcDateAtStartOfDay(payload.date)
        : toUtcDateAtStartOfDay(getCurrentDhakaDateString()),
      amount: payload.amount,
      category: payload.category,
      personName: payload.personName,
      description: payload.description,
      loggedById: payload.loggedById,
      month: payload.month,
    },
  });
};

const updateExpense = async (id: string, payload: UpdateExpensePayload) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Expense not found');
  await assertMonthNotFinalized(existing.month);

  if (payload.month && payload.month !== existing.month) {
    await assertMonthNotFinalized(payload.month);
  }

  if (payload.amount !== undefined && payload.amount <= 0) {
    throw new ApiError(400, 'Expense amount must be greater than 0');
  }

  return prisma.expense.update({
    where: { id },
    data: {
      date: payload.date ? toUtcDateAtStartOfDay(payload.date) : undefined,
      amount: payload.amount,
      category: payload.category,
      personName: payload.personName,
      description: payload.description,
      loggedById: payload.loggedById,
      month: payload.month,
    },
  });
};

const deleteExpense = async (id: string) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Expense not found');
  await assertMonthNotFinalized(existing.month);
  return prisma.expense.delete({ where: { id } });
};

export const ExpenseService = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
