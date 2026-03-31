import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RegistrationService } from './registration.service';

const getAllRegistrations = catchAsync(async (req, res) => {
  const userId = req.query.userId as string | undefined;
  const result = await RegistrationService.getAllRegistrations(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal registrations retrieved successfully!',
    data: result,
  });
});

const upsertRegistration = catchAsync(async (req, res) => {
  const result = await RegistrationService.upsertRegistration(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal registration created/updated successfully!',
    data: result,
  });
});

const deleteRegistration = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await RegistrationService.deleteRegistration(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal registration deleted successfully!',
    data: null,
  });
});

export const RegistrationController = {
  getAllRegistrations,
  upsertRegistration,
  deleteRegistration,
};
