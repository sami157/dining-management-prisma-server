import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    // firebaseUid: z.string(),
    // name: z.string(),
    // email: z.string().email(),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
};
