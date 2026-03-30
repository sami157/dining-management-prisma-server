import { z } from 'zod';

const registrationValidationSchema = z.object({
  body: z.object({
    scheduledMealId: z.string().min(1),
    userId: z.string().min(1),
    count: z.number().int().min(1),
    registeredById: z.string().min(1),
  }),
});

export const RegistrationValidation = {
  registrationValidationSchema,
};
