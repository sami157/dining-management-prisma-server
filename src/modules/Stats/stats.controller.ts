import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatsService } from './stats.service';

const getDailyStats = catchAsync(async (req, res) => {
  const date = Array.isArray(req.query.date) ? req.query.date[0] : req.query.date;
  const result = await StatsService.getDailyStats(date as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily statistics retrieved successfully!',
    data: result,
  });
});

const getPublicStats = catchAsync(async (req, res) => {
  const month = Array.isArray(req.query.month) ? req.query.month[0] : req.query.month;
  const result = await StatsService.getPublicStats(month as string | undefined);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Public statistics retrieved successfully!',
    data: result,
  });
});

const getOverviewStats = catchAsync(async (_req, res) => {
  const result = await StatsService.getOverviewStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Overview statistics retrieved successfully!',
    data: result,
  });
});

const getManagers = catchAsync(async (_req, res) => {
  const result = await StatsService.getManagers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Manager list retrieved successfully!',
    data: result,
  });
});

const getMonthlyStats = catchAsync(async (req, res) => {
  const month = Array.isArray(req.query.month) ? req.query.month[0] : req.query.month;
  const result = await StatsService.getMonthlyStats(month as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Monthly statistics retrieved successfully!',
    data: result,
  });
});

export const StatsController = {
  getDailyStats,
  getPublicStats,
  getOverviewStats,
  getManagers,
  getMonthlyStats,
};
