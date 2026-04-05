import { z } from 'zod';

const finalizationValidationSchema = z.object({
  body: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  }),
});

const rollbackFinalizationValidationSchema = z.object({
  params: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  }),
});

export const FinalizationValidation = {
  finalizationValidationSchema,
  rollbackFinalizationValidationSchema,
};
