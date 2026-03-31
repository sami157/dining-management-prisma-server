import ApiError from '../errors/ApiError';
import { prisma } from '../lib/prisma';
import { getMonthStringFromUtcDate } from './dateTime';

const assertMonthNotFinalized = async (month: string) => {
  const finalization = await prisma.monthlyFinalization.findUnique({ where: { month } });

  if (finalization?.isLocked) {
    throw new ApiError(400, `Month ${month} is already finalized and locked`);
  }
};

const assertDateNotFinalized = async (date: Date) => {
  await assertMonthNotFinalized(getMonthStringFromUtcDate(date));
};

export { assertMonthNotFinalized, assertDateNotFinalized };
