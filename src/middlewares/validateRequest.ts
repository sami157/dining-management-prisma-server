import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedRequest = (await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
      query: req.query,
      params: req.params,
    })) as Partial<Request>;

    req.body = parsedRequest.body ?? req.body;
    req.cookies = parsedRequest.cookies ?? req.cookies;
    req.query = parsedRequest.query ?? req.query;
    req.params = parsedRequest.params ?? req.params;

    next();
  });
};

export default validateRequest;
