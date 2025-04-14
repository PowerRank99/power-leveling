
import { DatabaseResult } from '@/types/workout';

/**
 * Creates a properly formatted DatabaseResult with success=true
 */
export function createSuccessResult<T>(data: T): DatabaseResult<T> {
  return {
    data,
    error: null,
    success: true
  };
}

/**
 * Creates a properly formatted DatabaseResult with success=false
 */
export function createErrorResult<T>(error: Error): DatabaseResult<T> {
  return {
    data: null,
    error,
    success: false
  };
}

/**
 * Creates a properly formatted DatabaseResult for void operations
 */
export function createVoidSuccessResult(): DatabaseResult<void> {
  return {
    data: null,
    error: null,
    success: true
  };
}

/**
 * Helper to ensure all required DatabaseResult properties are present
 */
export function ensureCompleteResult<T>(result: Partial<DatabaseResult<T>>): DatabaseResult<T> {
  return {
    data: result.data !== undefined ? result.data : null,
    error: result.error !== undefined ? result.error : null,
    success: result.success !== undefined ? result.success : !result.error
  };
}
