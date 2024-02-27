import AppError from '~/errors/app-error';

export default class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, { statusCode: 404 });
  }
}
