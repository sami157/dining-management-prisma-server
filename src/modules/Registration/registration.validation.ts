import { z } from 'zod';

const registrationValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const RegistrationValidation = {
  registrationValidationSchema,
};
