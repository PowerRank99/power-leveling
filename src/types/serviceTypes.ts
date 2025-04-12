
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

/**
 * Generic database operation result with error handling
 */
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
}

/**
 * Updated database result to match the new standardized format
 */
export type StandardDatabaseResult<T> = ServiceResponse<T>;
