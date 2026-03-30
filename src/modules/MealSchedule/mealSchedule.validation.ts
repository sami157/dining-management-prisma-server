import { z } from 'zod';

const scheduleValidationSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    createdById: z.string().min(1, 'createdById is required'),
    meals: z.array(
      z.object({
        type: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
        isAvailable: z.boolean().optional(),
        weight: z.number().positive().optional(),
        menu: z.string().optional(),
      }),
    ),
  }),
});

export const MealScheduleValidation = {
  scheduleValidationSchema,
};
