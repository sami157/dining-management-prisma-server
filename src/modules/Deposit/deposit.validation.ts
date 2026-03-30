import { z } from 'zod';

const depositValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const DepositValidation = {
  depositValidationSchema,
};
