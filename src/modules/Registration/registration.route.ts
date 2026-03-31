import express from 'express';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { RegistrationController } from './registration.controller';
import { RegistrationValidation } from './registration.validation';

const router = express.Router();

router.get('/', firebaseAuthMiddleware(), RegistrationController.getAllRegistrations);
router.post(
  '/',
  firebaseAuthMiddleware(),
  validateRequest(RegistrationValidation.registrationValidationSchema),
  RegistrationController.upsertRegistration,
);
router.patch(
  '/:id',
  firebaseAuthMiddleware(),
  validateRequest(RegistrationValidation.updateRegistrationValidationSchema),
  RegistrationController.updateRegistration,
);
router.delete('/:id', firebaseAuthMiddleware(), RegistrationController.deleteRegistration);

export const RegistrationRoutes = router;
