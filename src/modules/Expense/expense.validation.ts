import { z } from 'zod';

const expenseValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const ExpenseValidation = {
  expenseValidationSchema,
};
