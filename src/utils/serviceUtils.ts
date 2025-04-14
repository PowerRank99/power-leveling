
import { DatabaseResult } from '@/types/workout';

/**
 * Creates a success result with the given data
 */
export function createSuccessResult<T>(data: T): DatabaseResult<T> {
  return {
    success: true,
    data,
    error: null
  };
}

/**
 * Creates a void success result (for operations that don't return data)
 */
export function createVoidSuccessResult(): DatabaseResult<void> {
  return {
    success: true,
    data: null,
    error: null
  };
}

/**
 * Creates an error result with the given error
 */
export function createErrorResult<T>(error: Error | any): DatabaseResult<T> {
  return {
    success: false,
    data: null,
    error: error instanceof Error ? error : new Error(String(error))
  };
}

/**
 * Creates a detailed error result with code and message
 */
export function createDetailedErrorResult<T>(
  message: string, 
  code: string = 'ERROR', 
  originalError?: Error
): DatabaseResult<T> {
  const error = new Error(message);
  (error as any).code = code;
  (error as any).originalError = originalError;
  
  return {
    success: false,
    data: null,
    error
  };
}

/**
 * Converts a service response to a database result
 */
export function serviceResponseToDatabaseResult<T>(
  response: { success: boolean; data?: T; error?: Error | any; message?: string }
): DatabaseResult<T> {
  if (response.success && response.data !== undefined) {
    return createSuccessResult(response.data);
  } else {
    const errorMessage = response.message || 
      (response.error instanceof Error ? response.error.message : 'Unknown error');
    return createErrorResult(response.error || new Error(errorMessage));
  }
}
