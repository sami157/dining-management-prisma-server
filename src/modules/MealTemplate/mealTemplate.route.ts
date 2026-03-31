import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { MealTemplateController } from './mealTemplate.controller';
import { MealTemplateValidation } from './mealTemplate.validation';

const router = express.Router();

router.get('/', firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER), MealTemplateController.getTemplate);
router.patch(
  '/',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(MealTemplateValidation.templateValidationSchema),
  MealTemplateController.upsertTemplate,
);
router.post(
  '/',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(MealTemplateValidation.templateValidationSchema),
  MealTemplateController.upsertTemplate,
);

export const MealTemplateRoutes = router;
