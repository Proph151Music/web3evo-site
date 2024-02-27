/**
 * The main Error sub-class of the app.
 * All custom errors that the developer expects should extend this class and assign a `statusCode`.
 *
 * The `statusCode` field will be used in the response sent by the global error handler.
 *
 * Errors not extending this class will have the `500` status code.
 */
export default class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly name: string;

  constructor(message: string, { statusCode = 500 }: { statusCode?: number } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name;

    // to prevent the call of `new AppError` from showing up in the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
