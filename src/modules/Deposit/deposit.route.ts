import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { DepositController } from './deposit.controller';
import { DepositValidation } from './deposit.validation';

const router = express.Router();

router.get('/', firebaseAuthMiddleware(), DepositController.getAllDeposits);
router.get(
  '/my-total',
  firebaseAuthMiddleware(),
  validateRequest(DepositValidation.monthlyDepositQuerySchema),
  DepositController.getMyMonthlyDepositTotal,
);
router.post(
  '/',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(DepositValidation.depositValidationSchema),
  DepositController.createDeposit,
);
router.patch(
  '/:id',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(DepositValidation.updateDepositValidationSchema),
  DepositController.updateDeposit,
);
router.delete('/:id', firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER), DepositController.deleteDeposit);

export const DepositRoutes = router;
