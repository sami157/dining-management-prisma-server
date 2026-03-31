import { z } from 'zod';

const userValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    mobile: z.string().optional(),
    profileImage: z.string().url().optional(),
  }),
});

const selfUpdateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    mobile: z.string().optional(),
    profileImage: z.string().url().optional(),
  }),
});

const roleUpdateValidationSchema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
  }),
});

export const UserValidation = {
  userValidationSchema,
  selfUpdateValidationSchema,
  roleUpdateValidationSchema,
};
