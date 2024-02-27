import axios from 'axios';
import NetworkError from '~/errors/network-error';
import { logError } from '~/utils/log';

/**
 * Wrapper static class for the `axios` instance.
 * Exposes `axios` methods with logging functionality for the requests and responses.
 */
export default class Axios {
  static async get<T = unknown>(...args: Parameters<typeof axios.get>) {
    const [url, config] = args;
    return await Axios.request<T>({ method: 'get', url, ...config });
  }

  static async post<T = unknown>(...args: Parameters<typeof axios.post>) {
    const [url, data, config] = args;
    return await Axios.request<T>({ method: 'post', url, data, ...config });
  }

  static async request<T = unknown>(...args: Parameters<typeof axios.request>) {
    const [config] = args;

    try {
      console.log('Request:', config.url ?? config);
      const response = await axios.request<T>(config);
      console.log('Response:', response.data);
      return response;
    } catch (error) {
      logError(error);
      throw new NetworkError('API request failed');
    }
  }
}
