import axios, { AxiosError } from 'axios';
import AppError from '../error/custom-error';

/**
 * Wrapper static class for the `axios` instance.
 * Exposes `axios` methods with logging functionality for the requests and responses.
 */
export default class Axios {
  static async get<T = unknown>(...args: Parameters<typeof axios.get>) {
    const [url, config] = args;
    const { method, ...rest } = config ?? {};
    return await Axios.request<T>({ method: 'get', url, ...rest });
  }

  static async post<T = unknown>(...args: Parameters<typeof axios.post>) {
    const [url, data, config] = args;
    const { method, ...rest } = config ?? {};
    return await Axios.request<T>({ method: 'post', url, data, ...rest });
  }

  static async head<T = unknown>(...args: Parameters<typeof axios.head>) {
    const [url, config] = args;
    const { method, ...rest } = config ?? {};
    return await Axios.request<T>({ method: 'head', url, ...rest });
  }

  static async request<T = unknown>(...args: Parameters<typeof axios.request>) {
    const [config] = args;

    try {
      return await axios.request<T>(config);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(`Axios Error: ${error.code}`, error.response?.data);
        throw error;
      } else if (isError(error)) {
        console.log(error.name, error.message);
        throw new AppError({ code: 0, name: error.name, message: error.message });
      } else {
        console.log('Unknown Error:', error);
        throw new AppError({ code: 0, name: 'Unknown error', message: 'Unknown error' });
      }
    }
  }
}

/***********************************
 *         Utility Methods         *
 ***********************************/
export function isAxiosError(value: unknown): value is AxiosError {
  return !!value && typeof value === 'object' && 'isAxiosError' in value && !!value.isAxiosError;
}

export function isAppErrorResponse(value: unknown): value is { error: AppError } {
  return (
    !!value &&
    typeof value === 'object' &&
    'error' in value &&
    !!value.error &&
    typeof value.error === 'object' &&
    'isOperational' in value.error &&
    !!value.error.isOperational
  );
}

export function isError(value: unknown): value is Error {
  return (
    !!value &&
    typeof value === 'object' &&
    'name' in value &&
    !!value.name &&
    'message' in value &&
    !!value.message
  );
}
