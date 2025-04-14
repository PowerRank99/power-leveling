
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorCategory, createErrorResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';

/**
 * Base service for fetching achievement data
 * Contains common utility methods for achievement services
 */
export class BaseAchievementFetchService {
  /**
   * Handle database query errors
   */
  protected static handleQueryError(error: any, operationName: string): ServiceResponse<any> {
    return createErrorResponse(
      error.message, 
      `Failed to ${operationName}: ${error.message}`, 
      ErrorCategory.DATABASE
    );
  }
  
  /**
   * Handle exceptions in service methods
   */
  protected static handleException(error: any, operationName: string): ServiceResponse<any> {
    return createErrorResponse(
      (error as Error).message, 
      `Exception ${operationName}: ${(error as Error).message}`, 
      ErrorCategory.EXCEPTION
    );
  }
}
