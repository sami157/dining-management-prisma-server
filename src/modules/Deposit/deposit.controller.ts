import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DepositService } from './deposit.service';

const getAllDeposits = catchAsync(async (req, res) => {
  const userId = (req.query.userId as string) || undefined;
  const requester = req.firebaseUser;

  if (!requester) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const scopedUserId = requester.role === 'MEMBER' ? requester.id : userId;
  const result = await DepositService.getAllDeposits(scopedUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deposits retrieved successfully!',
    data: result,
  });
});

const createDeposit = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const result = await DepositService.createDeposit({
    ...req.body,
    recordedById: actorId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Deposit recorded successfully!',
    data: result,
  });
});

const getMyMonthlyDepositTotal = catchAsync(async (req, res) => {
  const month = Array.isArray(req.query.month) ? req.query.month[0] : req.query.month;
  const userId = req.firebaseUser?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const result = await DepositService.getMonthlyTotalByUser(userId, month as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Monthly deposit total retrieved successfully!',
    data: result,
  });
});

const updateDeposit = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const result = await DepositService.updateDeposit(id, {
    ...req.body,
    recordedById: actorId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deposit updated successfully!',
    data: result,
  });
});

const deleteDeposit = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await DepositService.deleteDeposit(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deposit deleted successfully!',
    data: null,
  });
});

export const DepositController = {
  getAllDeposits,
  createDeposit,
  getMyMonthlyDepositTotal,
  updateDeposit,
  deleteDeposit,
};
