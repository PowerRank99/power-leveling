
export enum ErrorCategory {
  DATA_ERROR = 'DATA_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  NOT_FOUND = 'NOT_FOUND',
  // Add missing error categories
  VALIDATION = 'VALIDATION',
  EXCEPTION = 'EXCEPTION',
  PROCESSING_ERROR = 'PROCESSING_ERROR'
}

export interface ServiceError {
  message: string;
  details?: string;
  category: ErrorCategory;
  originalError?: any;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  message?: string;
  details?: string;
}

export function createSuccessResponse<T>(data: T): ServiceResponse<T> {
  return {
    success: true,
    data
  };
}

export function createErrorResponse(
  message: string,
  details?: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN_ERROR,
  originalError?: any
): ServiceResponse {
  return {
    success: false,
    message: message,
    details: details,
    error: {
      message,
      details,
      category,
      originalError
    }
  };
}

export class ErrorHandlingService {
  static handleError(error: any, defaultMessage = 'An unexpected error occurred'): ServiceError {
    const message = error?.message || defaultMessage;
    const category = this.determineErrorCategory(error);
    
    return {
      message,
      category,
      originalError: error
    };
  }
  
  static executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      showToast?: boolean;
      errorMessage?: string;
      successMessage?: string;
      userMessage?: string; // Add the missing userMessage option
    } = {}
  ): Promise<ServiceResponse<T>> {
    return new Promise<ServiceResponse<T>>(async (resolve) => {
      try {
        const result = await operation();
        resolve(createSuccessResponse(result));
      } catch (error) {
        console.error(`Error in ${operationName}:`, error);
        resolve(createErrorResponse(
          options.errorMessage || `Error in ${operationName}`,
          error instanceof Error ? error.message : String(error),
          this.determineErrorCategory(error),
          error
        ));
      }
    });
  }
  
  private static determineErrorCategory(error: any): ErrorCategory {
    if (error?.code === 'PGRST301' || error?.code?.startsWith('PGRST')) {
      return ErrorCategory.DATA_ERROR;
    }
    
    if (error?.message?.includes('auth') || error?.code === 'auth/') {
      return ErrorCategory.AUTH_ERROR;
    }
    
    if (error?.response || error?.request) {
      return ErrorCategory.API_ERROR;
    }
    
    if (error?.name === 'ValidationError') {
      return ErrorCategory.VALIDATION_ERROR;
    }
    
    return ErrorCategory.UNKNOWN_ERROR;
  }
}
