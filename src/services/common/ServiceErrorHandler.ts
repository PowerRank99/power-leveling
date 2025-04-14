
import { toast } from 'sonner';
import { DatabaseResult } from '@/types/workout';
import { createErrorResult } from '@/utils/serviceUtils';

/**
 * Standard error handler for service operations
 */
export class ServiceErrorHandler {
  /**
   * Execute a function with standardized error handling
   * Returns a DatabaseResult with appropriate success/error states
   */
  static async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      showToast?: boolean;
      errorMessage?: string;
      successMessage?: string;
    } = {}
  ): Promise<DatabaseResult<T>> {
    try {
      const result = await operation();
      
      if (options.showToast && options.successMessage) {
        toast.success(options.successMessage);
      }
      
      return {
        success: true,
        data: result,
        error: null
      };
    } catch (error) {
      console.error(`Error in ${operationName}:`, error);
      
      if (options.showToast) {
        toast.error(options.errorMessage || 'An error occurred');
      }
      
      return createErrorResult<T>(error);
    }
  }
  
  /**
   * Display a standardized error message for a failed operation
   */
  static displayError(operationName: string, error: Error | any): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in ${operationName}:`, error);
    toast.error(`Operation failed: ${message}`);
  }
}
