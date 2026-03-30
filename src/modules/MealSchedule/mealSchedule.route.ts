import express from 'express';
import { MealScheduleController } from './mealSchedule.controller';

const router = express.Router();

router.get('/', MealScheduleController.getAllSchedules);

export const MealScheduleRoutes = router;
