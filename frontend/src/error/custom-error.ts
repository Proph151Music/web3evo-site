type AppErrorParams = {
  name?: string;
  code?: number;
  message: string;
};

export default class AppError extends Error {
  code: number;

  constructor({ code = 0, name = 'AppError', message }: AppErrorParams) {
    super(message);
    this.name = name;
    this.code = code;
  }
}
