import { z } from 'zod';

const expenseValidationSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    amount: z.number().positive('amount must be greater than 0'),
    category: z.enum(['GAS', 'TRANSPORT', 'BAZAR', 'OTHER']),
    personName: z.string().min(1, 'personName is required'),
    description: z.string().optional(),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  }),
});

const updateExpenseValidationSchema = z.object({
  body: z
    .object({
      date: z.string().optional(),
      amount: z.number().positive('amount must be greater than 0').optional(),
      category: z.enum(['GAS', 'TRANSPORT', 'BAZAR', 'OTHER']).optional(),
      personName: z.string().min(1, 'personName is required').optional(),
      description: z.string().optional(),
      month: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM')
        .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required to update expense',
    }),
});

export const ExpenseValidation = {
  expenseValidationSchema,
  updateExpenseValidationSchema,
};
