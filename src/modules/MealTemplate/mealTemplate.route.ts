import express from 'express';
import { MealTemplateController } from './mealTemplate.controller';

const router = express.Router();

router.get('/', MealTemplateController.getTemplate);

export const MealTemplateRoutes = router;
