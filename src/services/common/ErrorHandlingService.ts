/**
 * Error categories for consistent error handling
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  BUSINESS_LOGIC = 'business_logic',
  EXCEPTION = 'exception',
  UNKNOWN = 'unknown',
  PROCESSING_ERROR = 'processing_error',
  NOT_FOUND = 'not_found'
}

/**
 * Error structure for consistent error handling
 */
export interface ServiceError {
  message: string;
  technical?: string;
  category?: ErrorCategory;
  code?: string;
  details?: any;
}

/**
 * Generic response object for service operations
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: Error | ServiceError;
  details?: string;
}

// Backward compatibility type alias (deprecated)
export type ServiceErrorResponse = ServiceResponse<any>;

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
    options: { 
      showToast?: boolean; 
      userMessage?: string;
      logError?: boolean;
    } = { showToast: true, logError: true }
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await fn();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (options.logError !== false) {
        console.error(`Error during ${operation}:`, error);
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        error: error instanceof Error ? error : new Error('Unknown error'),
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }
  
  /**
   * Transform an error to a consistent service error format
   */
  static formatError(
    error: any,
    defaultMessage: string = 'An error occurred',
    category: ErrorCategory = ErrorCategory.UNKNOWN
  ): ServiceError {
    if (!error) {
      return { message: defaultMessage, category };
    }
    
    if (typeof error === 'string') {
      return { message: error, category };
    }
    
    if (error instanceof Error) {
      return {
        message: error.message || defaultMessage,
        technical: error.stack,
        category
      };
    }
    
    return {
      message: error.message || defaultMessage,
      technical: JSON.stringify(error),
      category,
      details: error
    };
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
export function createErrorResponse(
  message: string,
  technical: string = '',
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  code: string = 'ERROR'
): ServiceResponse<any> {
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
