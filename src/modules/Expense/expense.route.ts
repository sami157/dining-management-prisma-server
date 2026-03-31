import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { ExpenseController } from './expense.controller';
import { ExpenseValidation } from './expense.validation';

const router = express.Router();

router.get('/', firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER), ExpenseController.getAllExpenses);
router.post(
  '/',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(ExpenseValidation.expenseValidationSchema),
  ExpenseController.createExpense,
);
router.patch(
  '/:id',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(ExpenseValidation.updateExpenseValidationSchema),
  ExpenseController.updateExpense,
);
router.delete('/:id', firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER), ExpenseController.deleteExpense);

export const ExpenseRoutes = router;
