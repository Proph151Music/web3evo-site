import AppError from '~/errors/app-error';

export default class AuthError extends AppError {
  constructor(message: string) {
    super(message, { statusCode: 403 });
  }
}
