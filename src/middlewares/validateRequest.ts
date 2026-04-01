import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import catchAsync from '../utils/catchAsync';

const replaceObjectValues = (
  target: Record<string, unknown> | undefined,
  source: Record<string, unknown> | undefined,
) => {
  if (!target || !source) {
    return;
  }

  Object.keys(target).forEach((key) => {
    delete target[key];
  });

  Object.assign(target, source);
};

const validateRequest = (schema: ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedRequest = (await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
      query: req.query,
      params: req.params,
    })) as Partial<Request>;

    if (parsedRequest.body) {
      req.body = parsedRequest.body;
    }

    replaceObjectValues(req.cookies as Record<string, unknown> | undefined, parsedRequest.cookies);
    replaceObjectValues(req.query as Record<string, unknown>, parsedRequest.query);
    replaceObjectValues(req.params as Record<string, unknown>, parsedRequest.params);

    next();
  });
};

export default validateRequest;
