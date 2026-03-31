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

const createSchedule = catchAsync(async (req, res) => {
  const { date, createdById, meals } = req.body;
  const result = await MealScheduleService.createSchedule(date, createdById, meals);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal schedule created successfully!',
    data: result,
  });
});

const deleteSchedule = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await MealScheduleService.deleteSchedule(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal schedule deleted successfully!',
    data: null,
  });
});

export const MealScheduleController = {
  getAllSchedules,
  createSchedule,
  deleteSchedule,
};
