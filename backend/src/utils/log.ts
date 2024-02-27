import { AxiosError } from 'axios';

export function logError(error: unknown) {
  if (isAxiosError(error)) {
    console.log('Axios Error:', error.message, error.response?.data);
  } else if (isError(error)) {
    console.log(error.name, error.message);
  } else {
    console.log('Error:', error);
  }
}

/***********************************
 *         Utility Methods         *
 ***********************************/
function isAxiosError(value: unknown): value is AxiosError {
  return !!value && typeof value === 'object' && 'isAxiosError' in value && !!value.isAxiosError;
}

function isError(value: unknown): value is Error {
  return (
    !!value &&
    typeof value === 'object' &&
    'name' in value &&
    !!value.name &&
    'message' in value &&
    !!value.message
  );
}
