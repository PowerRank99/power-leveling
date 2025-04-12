
/**
 * Standardized error handling and response types for services
 */

/**
 * Base service response interface
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: string;
}

/**
 * Success response type
 */
export interface ServiceSuccessResponse<T> extends ServiceResponse<T> {
  success: true;
  data: T;
}

/**
 * Error response type
 */
export interface ServiceErrorResponse extends ServiceResponse<never> {
  success: false;
  message: string;
  details?: string;
  error: {
    message: string;
    technical: string;
  };
}

/**
 * Options for error handling
 */
interface ErrorHandlingOptions {
  showToast?: boolean;
  userMessage?: string;
  errorCode?: string;
}

/**
 * Service for standardized error handling across the application
 */
export class ErrorHandlingService {
  /**
   * Execute a function with standardized error handling
   */
  static async executeWithErrorHandling<T>(
    fn: () => Promise<T>,
    errorCode: string,
    options: ErrorHandlingOptions = {}
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await fn();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error in ${errorCode}:`, error);
      
      return {
        success: false,
        message: options.userMessage || 'An error occurred',
        details: error instanceof Error ? error.message : String(error),
        error: {
          message: options.userMessage || 'An error occurred',
          technical: error instanceof Error ? error.message : String(error) 
        }
      };
    }
  }
}
