import { z } from 'zod';

const mealDefinitionSchema = z.object({
  type: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
  isAvailable: z.boolean().optional(),
  weight: z.number().positive().optional(),
  menu: z.string().optional(),
});

const scheduleValidationSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    meals: z.array(mealDefinitionSchema),
  }),
});

const scheduleGenerationSchema = z.object({
  body: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  }),
});

const addMealSchema = z.object({
  body: mealDefinitionSchema,
});

const updateMealSchema = z.object({
  params: z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
  }),
  body: z.object({
    isAvailable: z.boolean().optional(),
    weight: z.number().positive().optional(),
    menu: z.string().optional(),
  }),
});

const scheduleQuerySchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD').optional(),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM').optional(),
  }),
});

export const MealScheduleValidation = {
  scheduleValidationSchema,
  scheduleGenerationSchema,
  addMealSchema,
  updateMealSchema,
  scheduleQuerySchema,
};
