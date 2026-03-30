import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    firebaseUid: z.string().min(1, 'firebaseUid is required'),
    name: z.string().min(1, 'name is required'),
    email: z.string().email('email must be valid'),
    mobile: z.string().optional(),
    profileImage: z.string().url('profileImage must be a valid URL').optional(),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
};
