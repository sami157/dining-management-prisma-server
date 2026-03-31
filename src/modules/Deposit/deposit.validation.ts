import { z } from 'zod';

const depositValidationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
    amount: z.number().positive('amount must be greater than 0'),
    recordedById: z.string().min(1, 'recordedById is required'),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
    note: z.string().optional(),
    date: z.string().optional(),
  }),
});

const monthlyDepositQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  }),
});

const updateDepositValidationSchema = z.object({
  body: z
    .object({
      userId: z.string().min(1, 'userId is required').optional(),
      amount: z.number().positive('amount must be greater than 0').optional(),
      recordedById: z.string().min(1, 'recordedById is required').optional(),
      month: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM')
        .optional(),
      note: z.string().optional(),
      date: z.string().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required to update deposit',
    }),
});

export const DepositValidation = {
  depositValidationSchema,
  monthlyDepositQuerySchema,
  updateDepositValidationSchema,
};
