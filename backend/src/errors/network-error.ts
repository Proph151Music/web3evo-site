import AppError from '~/errors/app-error';

export default class NetworkError extends AppError {
  constructor(message: string) {
    super(message, { statusCode: 500 });
  }
}
