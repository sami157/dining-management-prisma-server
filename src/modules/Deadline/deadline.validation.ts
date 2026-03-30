import { z } from 'zod';

const deadlineValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const DeadlineValidation = {
  deadlineValidationSchema,
};
