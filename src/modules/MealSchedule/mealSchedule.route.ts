import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { MealScheduleController } from './mealSchedule.controller';
import { MealScheduleValidation } from './mealSchedule.validation';

const router = express.Router();

router.get('/', validateRequest(MealScheduleValidation.scheduleQuerySchema), MealScheduleController.getAllSchedules);
router.post(
  '/generate',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(MealScheduleValidation.scheduleGenerationSchema),
  MealScheduleController.generateSchedules,
);
router.get('/:date/registrations', MealScheduleController.getDailyRegistrationSummary);
router.get('/:id', MealScheduleController.getScheduleById);
router.post(
  '/',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(MealScheduleValidation.scheduleValidationSchema),
  MealScheduleController.createSchedule,
);
router.post(
  '/:scheduleId/meals',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(MealScheduleValidation.addMealSchema),
  MealScheduleController.addMealToSchedule,
);
router.patch(
  '/:scheduleId/meals/:mealType',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(MealScheduleValidation.updateMealSchema),
  MealScheduleController.updateScheduledMeal,
);
router.delete(
  '/:scheduleId/meals/:mealType',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  MealScheduleController.deleteScheduledMeal,
);
router.delete('/:id', firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER), MealScheduleController.deleteSchedule);

export const MealScheduleRoutes = router;
