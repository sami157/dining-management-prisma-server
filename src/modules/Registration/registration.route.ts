import express from 'express';
import { RegistrationController } from './registration.controller';

const router = express.Router();

router.get('/', RegistrationController.getAllRegistrations);

export const RegistrationRoutes = router;
