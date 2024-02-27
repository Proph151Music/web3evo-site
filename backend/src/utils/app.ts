import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AnyZodObject } from 'zod';
import BadRequestError from '~/errors/bad-request-error';

// A subset type that includes only the async version of RequestHandler
type AsyncAppRequestHandler<Params, Response, Body, QueryParams> = (
  ...args: Parameters<RequestHandler<Params, Response, Body, QueryParams>>
) => Promise<void>;

/**
 * A higher-order function that wraps `fn` in an error catcher.
 * When an error is caught, it is forwarded to the next middleware.
 */
export function withErrorCatcher<P = unknown, Q = unknown, B = unknown, R = unknown>(
  fn: AsyncAppRequestHandler<P, R, B, Q>
) {
  return ((req, res, next) => {
    console.log(`${req.method.toUpperCase()} Request to: ${req.url}`);
    console.log({ body: req.body, query: req.query, params: req.params });
    fn(req, res, next)
      .then((_) => console.log('Request resolved successfully.'))
      .catch((e) => next(e))
      .finally(() => console.log('------------------'));
  }) as typeof fn;
}

/**
 * A validator function that helps identify undefined environment variables
 * that are required for the app to operate correctly.
 */
export function validateEnv() {
  const { env } = process;

  const missingVariables = [
    'NODE_ENV',
    'DATABASE_URL',
    'SERVER_HOST',
    'JWT_SECRET',
    'EMAIL_FROM',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_SECURE',
    'EMAIL_API_KEY',
    'EMAIL_SECRET_KEY'
  ].filter((variable) => env[variable] === undefined);

  if (missingVariables.length) {
    throw new Error(`The following environment variables are required: ${missingVariables}`);
  }
}

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Create an object to hold the parts of the request to validate
      const requestToValidate: Partial<Request> = {};

      // Add body, query, and params to the object if they are defined in the schema
      if (schema.shape.body) {
        requestToValidate.body = req.body;
      }
      if (schema.shape.query) {
        requestToValidate.query = req.query;
      }
      if (schema.shape.params) {
        requestToValidate.params = req.params;
      }

      // Validate the request
      schema.parse(requestToValidate);

      next();
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  };
}
