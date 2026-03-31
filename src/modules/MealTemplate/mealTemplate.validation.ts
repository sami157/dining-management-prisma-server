import { z } from 'zod';

const templateValidationSchema = z.object({
  body: z.object({
    dayOfWeek: z.enum(['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']),
    meals: z.array(z.enum(['BREAKFAST','LUNCH','DINNER'])).min(1),
  }),
});

export const MealTemplateValidation = {
  templateValidationSchema,
};
