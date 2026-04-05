import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { FinalizationController } from './finalization.controller';
import { FinalizationValidation } from './finalization.validation';

const router = express.Router();

router.get('/', firebaseAuthMiddleware(), FinalizationController.getAllFinalizations);
router.get('/:month', firebaseAuthMiddleware(), FinalizationController.getFinalizationByMonth);
router.post(
  '/',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(FinalizationValidation.finalizationValidationSchema),
  FinalizationController.finalizeMonth,
);
router.post(
  '/:month/rollback',
  firebaseAuthMiddleware(UserRole.ADMIN),
  validateRequest(FinalizationValidation.rollbackFinalizationValidationSchema),
  FinalizationController.rollbackMonth,
);

export const FinalizationRoutes = router;
