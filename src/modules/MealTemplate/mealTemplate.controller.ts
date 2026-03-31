import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MealTemplateService } from './mealTemplate.service';

const getTemplate = catchAsync(async (req, res) => {
  const result = await MealTemplateService.getTemplate();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal template retrieved successfully!',
    data: result,
  });
});

const upsertTemplate = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const { dayOfWeek, meals } = req.body;
  const result = await MealTemplateService.upsertTemplate(dayOfWeek, meals, actorId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal template updated successfully!',
    data: result,
  });
});

export const MealTemplateController = {
  getTemplate,
  upsertTemplate,
};
