import { z } from 'zod';

const deadlineValidationSchema = z.object({
  body: z.object({
    type: z
      .enum(['BREAKFAST', 'LUNCH', 'DINNER'])
      .transform((value) => value.toUpperCase() as 'BREAKFAST' | 'LUNCH' | 'DINNER'),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'time must be in HH:MM format'),
    offsetDays: z.number().int(),
  }),
});

const deadlineUpdateValidationSchema = z.object({
  params: z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
  }),
  body: z.object({
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'time must be in HH:MM format'),
    offsetDays: z.number().int(),
  }),
});

export const DeadlineValidation = {
  deadlineValidationSchema,
  deadlineUpdateValidationSchema,
};
