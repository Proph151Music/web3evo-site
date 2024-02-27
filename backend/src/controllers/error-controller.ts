import { Request, Response } from 'express';
import { NextFunction } from 'express';
import AppError from '~/errors/app-error';
import NotFoundError from '~/errors/not-found-error';

const buildErrorResponse = (error: Error | AppError) => {
  let statusCode = 'statusCode' in error ? error.statusCode : 500;
  let isErrorOperational = 'isOperational' in error ? error.isOperational : false;

  // In development mode, send everything to the client
  if (process.env.NODE_ENV === 'development') {
    return {
      statusCode,
      error
    };
  }

  if (error.name === NotFoundError.name) {
    return {
      statusCode: 404,
      error: {
        name: NotFoundError.name,
        message: error.message
      }
    };
  }

  // All AppError instances have this as true
  if (isErrorOperational) {
    return {
      statusCode,
      error: {
        name: error.name,
        message: error.message
      }
    };
  }

  // This will only happen when our code isn't what's explicitly throwing the error
  // We should not leak the error details to the client in that case
  return {
    statusCode: 500,
    message: 'An unkown error occurred.'
  };
};

export default function handleAppError(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (process.env.NODE_ENV === 'development') {
    console.trace(err);
  }

  const errorResponse = buildErrorResponse({
    name: err.name,
    message: err.message,
    statusCode: 'statusCode' in err ? err.statusCode : 500,
    isOperational: 'isOperational' in err ? err.isOperational : false
  });

  res.status(errorResponse.statusCode).json(errorResponse);
}
