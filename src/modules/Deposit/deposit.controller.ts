import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DepositService } from './deposit.service';

const getAllDeposits = catchAsync(async (req, res) => {
  const userId = (req.query.userId as string) || undefined;
  const result = await DepositService.getAllDeposits(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deposits retrieved successfully!',
    data: result,
  });
});

const createDeposit = catchAsync(async (req, res) => {
  const result = await DepositService.createDeposit(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Deposit recorded successfully!',
    data: result,
  });
});

export const DepositController = {
  getAllDeposits,
  createDeposit,
};
