import express from 'express';
import { DepositController } from './deposit.controller';

const router = express.Router();

router.get('/', DepositController.getAllDeposits);

export const DepositRoutes = router;
