import httpStatus from 'http-status';
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

export const MealTemplateController = {
  getTemplate,
};
