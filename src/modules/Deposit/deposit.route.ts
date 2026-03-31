import express from 'express';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { DepositController } from './deposit.controller';
import { DepositValidation } from './deposit.validation';

const router = express.Router();

router.get('/', DepositController.getAllDeposits);
router.get(
  '/my-total',
  firebaseAuthMiddleware(),
  validateRequest(DepositValidation.monthlyDepositQuerySchema),
  DepositController.getMyMonthlyDepositTotal,
);
router.post('/', validateRequest(DepositValidation.depositValidationSchema), DepositController.createDeposit);
router.patch(
  '/:id',
  validateRequest(DepositValidation.updateDepositValidationSchema),
  DepositController.updateDeposit,
);
router.delete('/:id', DepositController.deleteDeposit);

export const DepositRoutes = router;
