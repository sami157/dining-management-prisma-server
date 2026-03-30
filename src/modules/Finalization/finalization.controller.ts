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

export const FinalizationController = {
  getAllFinalizations,
};
