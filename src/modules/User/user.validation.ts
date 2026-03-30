import { z } from 'zod';

const userValidationSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
    isActive: z.boolean().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    mobile: z.string().optional(),
    profileImage: z.string().url().optional(),
  }),
});

export const UserValidation = {
  userValidationSchema,
};
