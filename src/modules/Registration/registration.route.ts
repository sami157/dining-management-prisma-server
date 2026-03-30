import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { RegistrationController } from './registration.controller';
import { RegistrationValidation } from './registration.validation';

const router = express.Router();

router.get('/', RegistrationController.getAllRegistrations);
router.post('/', validateRequest(RegistrationValidation.registrationValidationSchema), RegistrationController.upsertRegistration);
router.delete('/:id', RegistrationController.deleteRegistration);

export const RegistrationRoutes = router;
