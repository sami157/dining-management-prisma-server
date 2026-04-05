import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FinalizationService } from './finalization.service';

const getAllFinalizations = catchAsync(async (req, res) => {
  const requester = req.firebaseUser;
  if (!requester) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const result = await FinalizationService.getAllFinalizations(requester);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Monthly finalizations retrieved successfully!',
    data: result,
  });
});

const getFinalizationByMonth = catchAsync(async (req, res) => {
  const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
  const requester = req.firebaseUser;
  if (!requester) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const result = await FinalizationService.getFinalizationByMonth(month, requester);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Monthly finalization details retrieved successfully!',
    data: result,
  });
});

const finalizeMonth = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const { month } = req.body;
  const result = await FinalizationService.finalizeMonth(month, actorId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Month finalized successfully!',
    data: result,
  });
});

const rollbackMonth = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
  const result = await FinalizationService.rollbackMonth(month, actorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Month finalization rolled back successfully!',
    data: result,
  });
});

export const FinalizationController = {
  getAllFinalizations,
  getFinalizationByMonth,
  finalizeMonth,
  rollbackMonth,
};
