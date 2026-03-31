import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RegistrationService } from './registration.service';

const getAllRegistrations = catchAsync(async (req, res) => {
  const userId = req.query.userId as string | undefined;
  const requester = req.firebaseUser;
  if (!requester) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const scopedUserId = requester.role === 'MEMBER' ? requester.id : userId;
  const result = await RegistrationService.getAllRegistrations(scopedUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal registrations retrieved successfully!',
    data: result,
  });
});

const upsertRegistration = catchAsync(async (req, res) => {
  const requester = req.firebaseUser;
  if (!requester) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const result = await RegistrationService.upsertRegistration(
    {
      ...req.body,
      userId: req.body.userId ?? requester.id,
      registeredById: requester.id,
    },
    requester,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal registration created/updated successfully!',
    data: result,
  });
});

const updateRegistration = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const requester = req.firebaseUser;
  if (!requester) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  const { count } = req.body;
  const result = await RegistrationService.updateRegistration(id, count, requester.id, requester);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal registration updated successfully!',
    data: result,
  });
});

const deleteRegistration = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const requester = req.firebaseUser;
  if (!requester) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authenticated user context is missing');
  }

  await RegistrationService.deleteRegistration(id, requester);
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
  updateRegistration,
  deleteRegistration,
};
