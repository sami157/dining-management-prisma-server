import { z } from 'zod';

const templateValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const MealTemplateValidation = {
  templateValidationSchema,
};
