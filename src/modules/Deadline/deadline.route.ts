import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { DeadlineController } from './deadline.controller';
import { DeadlineValidation } from './deadline.validation';

const router = express.Router();

router.get('/', DeadlineController.getAllDeadlines);
router.patch(
  '/:mealType',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(DeadlineValidation.deadlineUpdateValidationSchema),
  DeadlineController.updateDeadline,
);
router.post(
  '/',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(DeadlineValidation.deadlineValidationSchema),
  DeadlineController.upsertDeadline,
);

export const DeadlineRoutes = router;
