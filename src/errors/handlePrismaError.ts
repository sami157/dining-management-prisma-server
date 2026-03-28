import { Prisma } from '@prisma/client';
import { TErrorSource, TGenericErrorResponse } from '../interfaces/error';

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = 'Prisma Error';
  let errorSources: TErrorSource[] = [];

  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate Enty';
    errorSources = [
      {
        path: '',
        message: `${err.meta?.target} already exists`,
      },
    ];
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record Not Found';
    errorSources = [
      {
        path: '',
        message: (err.meta?.cause as string) || 'Record not found',
      },
    ];
  } else {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaError;
