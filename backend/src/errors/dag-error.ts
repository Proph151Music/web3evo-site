import AppError from '~/errors/app-error';

export default class DagError extends AppError {
  constructor(message: string) {
    super(message, { statusCode: 503 });
  }
}
