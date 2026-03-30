import { z } from 'zod';

const finalizationValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const FinalizationValidation = {
  finalizationValidationSchema,
};
