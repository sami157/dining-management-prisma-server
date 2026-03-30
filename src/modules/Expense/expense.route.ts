import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ExpenseController } from './expense.controller';
import { ExpenseValidation } from './expense.validation';

const router = express.Router();

router.get('/', ExpenseController.getAllExpenses);
router.post('/', validateRequest(ExpenseValidation.expenseValidationSchema), ExpenseController.createExpense);
router.delete('/:id', ExpenseController.deleteExpense);

export const ExpenseRoutes = router;
