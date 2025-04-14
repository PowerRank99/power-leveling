
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { DatabaseResult } from '@/types/workout';
import { createSuccessResult, createErrorResult } from './serviceUtils';

/**
 * Convert a ServiceResponse to a DatabaseResult
 */
export function mapServiceResponseToDatabaseResult<T>(
  response: ServiceResponse<T>
): DatabaseResult<T> {
  if (response.success && response.data !== undefined) {
    return createSuccessResult(response.data);
  } else {
    return createErrorResult(response.error || new Error(response.message || 'Unknown error'));
  }
}

/**
 * Convert a DatabaseResult to a ServiceResponse
 */
export function mapDatabaseResultToServiceResponse<T>(
  result: DatabaseResult<T>
): ServiceResponse<T> {
  if (result.success && result.data !== undefined) {
    return {
      success: true,
      data: result.data
    };
  } else {
    return {
      success: false,
      message: result.error ? result.error.message : 'Unknown error',
      error: result.error
    };
  }
}
