import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MealScheduleService } from './mealSchedule.service';

const getAllSchedules = catchAsync(async (req, res) => {
  const result = await MealScheduleService.getAllSchedules();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal schedules retrieved successfully!',
    data: result,
  });
});

export const MealScheduleController = {
  getAllSchedules,
};
