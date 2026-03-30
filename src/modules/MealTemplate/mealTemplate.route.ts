import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { MealTemplateController } from './mealTemplate.controller';
import { MealTemplateValidation } from './mealTemplate.validation';

const router = express.Router();

router.get('/', MealTemplateController.getTemplate);
router.post('/', validateRequest(MealTemplateValidation.templateValidationSchema), MealTemplateController.upsertTemplate);

export const MealTemplateRoutes = router;
