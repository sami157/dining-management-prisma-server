import { z } from 'zod';

const finalizationValidationSchema = z.object({
  body: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
    finalizedById: z.string().min(1, 'finalizedById is required'),
  }),
});

export const FinalizationValidation = {
  finalizationValidationSchema,
};
