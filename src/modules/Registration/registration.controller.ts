import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RegistrationService } from './registration.service';

const getAllRegistrations = catchAsync(async (req, res) => {
  const result = await RegistrationService.getAllRegistrations();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal registrations retrieved successfully!',
    data: result,
  });
});

export const RegistrationController = {
  getAllRegistrations,
};
