
/**
 * Standardized error handling and response types for services
 */

/**
 * Error category enum for classifying errors
 */
export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC'
}

/**
 * Base service response interface
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: string;
  error?: {
    message: string;
    technical: string;
    category?: ErrorCategory;
    code?: string;
  };
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
    category?: ErrorCategory;
    code?: string;
  };
}

/**
 * Options for error handling
 */
interface ErrorHandlingOptions {
  showToast?: boolean;
  userMessage?: string;
  errorCode?: string;
  errorCategory?: ErrorCategory;
  logLevel?: 'error' | 'warn' | 'info';
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): ServiceSuccessResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string, 
  technical: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  code?: string
): ServiceErrorResponse {
  return {
    success: false,
    message,
    error: {
      message,
      technical,
      category,
      code
    }
  };
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
      return createSuccessResponse(result);
    } catch (error) {
      if (options.logLevel === 'warn') {
        console.warn(`[${errorCode}]:`, error);
      } else {
        console.error(`[${errorCode}]:`, error);
      }
      
      return {
        success: false,
        message: options.userMessage || 'An error occurred',
        details: error instanceof Error ? error.message : String(error),
        error: {
          message: options.userMessage || 'An error occurred',
          technical: error instanceof Error ? error.message : String(error),
          category: options.errorCategory || ErrorCategory.UNKNOWN,
          code: options.errorCode || errorCode
        }
      };
    }
  }
  
  /**
   * Execute a function with standardized error handling and predefined error response
   */
  static async executeWithPredefinedErrorHandling<T>(
    fn: () => Promise<T>,
    errorResponse: ServiceErrorResponse,
    errorCode: string
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await fn();
      return createSuccessResponse(result);
    } catch (error) {
      console.error(`[${errorCode}]:`, error);
      
      // Add technical details to predefined error response
      return {
        ...errorResponse,
        details: error instanceof Error ? error.message : String(error),
        error: {
          ...errorResponse.error,
          technical: error instanceof Error ? error.message : String(error),
          code: errorResponse.error.code || errorCode
        }
      };
    }
  }
}
