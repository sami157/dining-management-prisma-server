import express from 'express';
import { ExpenseController } from './expense.controller';

const router = express.Router();

router.get('/', ExpenseController.getAllExpenses);

export const ExpenseRoutes = router;
