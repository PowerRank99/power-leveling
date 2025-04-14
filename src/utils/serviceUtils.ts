
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
