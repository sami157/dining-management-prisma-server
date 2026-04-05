import { z } from 'zod';

const monthlyStatsQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  }),
});

const dailyStatsQuerySchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'date must be YYYY-MM-DD'),
  }),
});

const publicStatsQuerySchema = z.object({
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM')
      .optional(),
  }),
});

export const StatsValidation = {
  dailyStatsQuerySchema,
  monthlyStatsQuerySchema,
  publicStatsQuerySchema,
};
