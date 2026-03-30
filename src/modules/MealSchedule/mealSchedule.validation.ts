import { z } from 'zod';

const scheduleValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const MealScheduleValidation = {
  scheduleValidationSchema,
};
