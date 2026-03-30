import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ExpenseService } from './expense.service';

const getAllExpenses = catchAsync(async (req, res) => {
  const month = req.query.month as string | undefined;
  const result = await ExpenseService.getAllExpenses(month);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expenses retrieved successfully!',
    data: result,
  });
});

const createExpense = catchAsync(async (req, res) => {
  const result = await ExpenseService.createExpense(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Expense logged successfully!',
    data: result,
  });
});

const deleteExpense = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ExpenseService.deleteExpense(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense deleted successfully!',
    data: null,
  });
});

export const ExpenseController = {
  getAllExpenses,
  createExpense,
  deleteExpense,
};
