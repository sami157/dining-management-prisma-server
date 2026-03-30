import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { DepositController } from './deposit.controller';
import { DepositValidation } from './deposit.validation';

const router = express.Router();

router.get('/', DepositController.getAllDeposits);
router.post('/', validateRequest(DepositValidation.depositValidationSchema), DepositController.createDeposit);

export const DepositRoutes = router;
