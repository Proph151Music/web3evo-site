import { useCallback, useRef, useState } from 'react';
import { isAppErrorResponse, isAxiosError, isError } from '../lib/axios';
import { AxiosError } from 'axios';
import AppError from '../error/custom-error';

export default function useQueryCallback<T>(callback: (...args: any[]) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | AppError | null>(null);

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const query = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      const response = await callbackRef.current(...args);
      setError(null);
      return response;
    } catch (error) {
      if (isAxiosError(error)) {
        const response = error.response?.data;
        if (isAppErrorResponse(response)) {
          setError(response.error);
        } else {
          setError(error);
        }
      } else if (isError(error)) {
        setError({
          code: 0,
          name: error.name,
          message: error.message,
          isAxiosError: false
        });
      } else {
        setError({
          code: 0,
          name: 'UnknownError',
          message: 'Unknown error occurred',
          isAxiosError: false
        });
      }
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, reset, query };
}
