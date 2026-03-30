import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ExpenseService } from './expense.service';

const getAllExpenses = catchAsync(async (req, res) => {
  const result = await ExpenseService.getAllExpenses();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expenses retrieved successfully!',
    data: result,
  });
});

export const ExpenseController = {
  getAllExpenses,
};
