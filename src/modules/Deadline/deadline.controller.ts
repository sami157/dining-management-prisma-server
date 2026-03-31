import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DeadlineService } from './deadline.service';

const getAllDeadlines = catchAsync(async (req, res) => {
  const result = await DeadlineService.getAllDeadlines();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal deadlines retrieved successfully!',
    data: result,
  });
});

const upsertDeadline = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const result = await DeadlineService.upsertDeadline({
    ...req.body,
    updatedById: actorId,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal deadline created/updated successfully!',
    data: result,
  });
});

const updateDeadline = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const mealType = Array.isArray(req.params.mealType) ? req.params.mealType[0] : req.params.mealType;
  const result = await DeadlineService.upsertDeadline({
    ...req.body,
    type: mealType as 'BREAKFAST' | 'LUNCH' | 'DINNER',
    updatedById: actorId,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal deadline updated successfully!',
    data: result,
  });
});

export const DeadlineController = {
  getAllDeadlines,
  upsertDeadline,
  updateDeadline,
};
