import httpStatus from 'http-status';
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
  const result = await DeadlineService.upsertDeadline(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal deadline created/updated successfully!',
    data: result,
  });
});

export const DeadlineController = {
  getAllDeadlines,
  upsertDeadline,
};
