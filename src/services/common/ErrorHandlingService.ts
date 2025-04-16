export type ErrorCategory = 'DATA_ERROR' | 'AUTH_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';

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
  category: ErrorCategory = 'UNKNOWN_ERROR',
  originalError?: any
): ServiceResponse {
  return {
    success: false,
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
  
  private static determineErrorCategory(error: any): ErrorCategory {
    if (error?.code === 'PGRST301' || error?.code?.startsWith('PGRST')) {
      return 'DATA_ERROR';
    }
    
    if (error?.message?.includes('auth') || error?.code === 'auth/') {
      return 'AUTH_ERROR';
    }
    
    if (error?.response || error?.request) {
      return 'API_ERROR';
    }
    
    if (error?.name === 'ValidationError') {
      return 'VALIDATION_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }
}
