import { z } from 'zod';

const userValidationSchema = z.object({
  body: z.object({
    // Add validation properties
  }),
});

export const UserValidation = {
  userValidationSchema,
};
