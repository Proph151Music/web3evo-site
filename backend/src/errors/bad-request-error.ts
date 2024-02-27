import AppError from '~/errors/app-error';

export default class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, { statusCode: 400 });
  }
}
