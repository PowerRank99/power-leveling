
/**
 * Generic response object for service operations
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: Error;
}

/**
 * Service for handling errors consistently
 */
export class ErrorHandlingService {
  /**
   * Execute a function with standardized error handling
   */
  static async executeWithErrorHandling<T>(
    fn: () => Promise<T>,
    operation: string,
    options: { showToast?: boolean } = {}
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await fn();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error during ${operation}:`, error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T): ServiceResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(error: Error): ServiceResponse<any> {
  return {
    success: false,
    message: error.message,
    error
  };
}
