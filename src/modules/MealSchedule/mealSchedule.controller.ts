import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MealScheduleService } from './mealSchedule.service';
import { MealType } from '../../../generated/prisma/enums';

const getAllSchedules = catchAsync(async (req, res) => {
  const date = Array.isArray(req.query.date) ? req.query.date[0] : req.query.date;
  const month = Array.isArray(req.query.month) ? req.query.month[0] : req.query.month;
  const result = await MealScheduleService.getAllSchedules({
    date: date as string | undefined,
    month: month as string | undefined,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal schedules retrieved successfully!',
    data: result,
  });
});

const getScheduleById = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await MealScheduleService.getScheduleById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal schedule retrieved successfully!',
    data: result,
  });
});

const createSchedule = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const { date, meals } = req.body;
  const result = await MealScheduleService.createSchedule(date, actorId, meals);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal schedule created successfully!',
    data: result,
  });
});

const generateSchedules = catchAsync(async (req, res) => {
  const actorId = req.firebaseUser?.id;
  if (!actorId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const { month } = req.body;
  const result = await MealScheduleService.generateSchedules(month, actorId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal schedules generated successfully!',
    data: result,
  });
});

const getDailyRegistrationSummary = catchAsync(async (req, res) => {
  const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;
  const result = await MealScheduleService.getDailyRegistrationSummary(date);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily registration summary retrieved successfully!',
    data: result,
  });
});

const addMealToSchedule = catchAsync(async (req, res) => {
  const scheduleId = Array.isArray(req.params.scheduleId) ? req.params.scheduleId[0] : req.params.scheduleId;
  const result = await MealScheduleService.addMealToSchedule(scheduleId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal added to schedule successfully!',
    data: result,
  });
});

const updateScheduledMeal = catchAsync(async (req, res) => {
  const scheduleId = Array.isArray(req.params.scheduleId) ? req.params.scheduleId[0] : req.params.scheduleId;
  const mealType = (Array.isArray(req.params.mealType) ? req.params.mealType[0] : req.params.mealType) as MealType;
  const result = await MealScheduleService.updateScheduledMeal(scheduleId, mealType, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Scheduled meal updated successfully!',
    data: result,
  });
});

const deleteScheduledMeal = catchAsync(async (req, res) => {
  const scheduleId = Array.isArray(req.params.scheduleId) ? req.params.scheduleId[0] : req.params.scheduleId;
  const mealType = (Array.isArray(req.params.mealType) ? req.params.mealType[0] : req.params.mealType) as MealType;
  await MealScheduleService.deleteScheduledMeal(scheduleId, mealType);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Scheduled meal deleted successfully!',
    data: null,
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
  getScheduleById,
  createSchedule,
  generateSchedules,
  getDailyRegistrationSummary,
  addMealToSchedule,
  updateScheduledMeal,
  deleteScheduledMeal,
  deleteSchedule,
};
