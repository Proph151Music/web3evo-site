import AppError from '~/errors/app-error';

export default class ConflictError extends AppError {
  constructor(message: string) {
    super(message, { statusCode: 409 });
  }
}
