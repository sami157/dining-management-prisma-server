import { z } from 'zod';

const expenseValidationSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    amount: z.number().positive('amount must be greater than 0'),
    category: z.enum(['GAS', 'TRANSPORT', 'BAZAR', 'OTHER']),
    personName: z.string().min(1, 'personName is required'),
    description: z.string().optional(),
    loggedById: z.string().min(1, 'loggedById is required'),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  }),
});

export const ExpenseValidation = {
  expenseValidationSchema,
};
