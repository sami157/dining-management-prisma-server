import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DepositService } from './deposit.service';

const getAllDeposits = catchAsync(async (req, res) => {
  const result = await DepositService.getAllDeposits();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deposits retrieved successfully!',
    data: result,
  });
});

export const DepositController = {
  getAllDeposits,
};
