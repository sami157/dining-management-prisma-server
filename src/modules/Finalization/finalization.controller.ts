import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FinalizationService } from './finalization.service';

const getAllFinalizations = catchAsync(async (req, res) => {
  const result = await FinalizationService.getAllFinalizations();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Monthly finalizations retrieved successfully!',
    data: result,
  });
});

const finalizeMonth = catchAsync(async (req, res) => {
  const { month, finalizedById } = req.body;
  const result = await FinalizationService.finalizeMonth(month, finalizedById);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Month finalized successfully!',
    data: result,
  });
});

export const FinalizationController = {
  getAllFinalizations,
  finalizeMonth,
};
