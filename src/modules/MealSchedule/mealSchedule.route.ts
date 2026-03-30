import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { MealScheduleController } from './mealSchedule.controller';
import { MealScheduleValidation } from './mealSchedule.validation';

const router = express.Router();

router.get('/', MealScheduleController.getAllSchedules);
router.post('/', validateRequest(MealScheduleValidation.scheduleValidationSchema), MealScheduleController.createSchedule);
router.delete('/:id', MealScheduleController.deleteSchedule);

export const MealScheduleRoutes = router;
