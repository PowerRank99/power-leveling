
import { toast } from 'sonner';

/**
 * Standard error response format for all services
 */
export interface ServiceErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    technical?: string;
  };
}

/**
 * Standard success response format with data
 */
export interface ServiceSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Combined type for service responses
 */
export type ServiceResponse<T> = ServiceSuccessResponse<T> | ServiceErrorResponse;

/**
 * Error categories to standardize error codes
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION_ERROR',
  DATABASE = 'DATABASE_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC_ERROR'
}

/**
 * Config options for error handling
 */
interface ErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
  userMessage?: string;
}

/**
 * Central error handling service for standardized error handling across the application
 */
export class ErrorHandlingService {
  /**
   * Handle an error with standardized approach
   */
  static handleError<T>(
    error: any, 
    context: string,
    options: ErrorHandlingOptions = { 
      showToast: true, 
      logToConsole: true, 
      rethrow: false 
    }
  ): ServiceErrorResponse {
    // Determine error category
    const category = this.categorizeError(error);
    
    // Create standardized error object
    const errorResponse: ServiceErrorResponse = {
      success: false,
      error: {
        code: `${context.toUpperCase()}_${category}`,
        message: options.userMessage || this.getUserFriendlyMessage(category),
        technical: error?.message || 'An unknown error occurred',
        details: this.extractErrorDetails(error)
      }
    };
    
    // Log error to console if enabled
    if (options.logToConsole) {
      console.error(`[${context}] Error:`, {
        error: error,
        response: errorResponse
      });
    }
    
    // Show toast notification if enabled
    if (options.showToast) {
      toast.error(errorResponse.error.message, {
        description: this.getToastDescription(category),
        duration: 5000
      });
    }
    
    // Rethrow or return based on configuration
    if (options.rethrow) {
      throw errorResponse;
    }
    
    return errorResponse;
  }
  
  /**
   * Create a success response
   */
  static createSuccessResponse<T>(data: T): ServiceSuccessResponse<T> {
    return {
      success: true,
      data
    };
  }
  
  /**
   * Categorize an error based on its type/properties
   */
  private static categorizeError(error: any): ErrorCategory {
    // Supabase PostgrestError
    if (error?.code && typeof error.code === 'string') {
      if (error.code.startsWith('22')) return ErrorCategory.VALIDATION;
      if (error.code.startsWith('23')) return ErrorCategory.DATABASE;
      if (error.code.startsWith('28')) return ErrorCategory.AUTHORIZATION;
      if (error.code === '42501') return ErrorCategory.AUTHORIZATION;
      if (error.code === '42P01') return ErrorCategory.NOT_FOUND;
    }
    
    // HTTP-like errors
    if (error?.status) {
      if (error.status === 401) return ErrorCategory.AUTHENTICATION;
      if (error.status === 403) return ErrorCategory.AUTHORIZATION;
      if (error.status === 404) return ErrorCategory.NOT_FOUND;
      if (error.status >= 400 && error.status < 500) return ErrorCategory.VALIDATION;
      if (error.status >= 500) return ErrorCategory.NETWORK;
    }
    
    // Auth errors
    if (error?.name === 'AuthError' || 
        error?.message?.includes('auth') || 
        error?.message?.includes('token')) {
      return ErrorCategory.AUTHENTICATION;
    }
    
    // Network related errors
    if (error instanceof TypeError && error.message?.includes('network')) {
      return ErrorCategory.NETWORK;
    }
    
    // Validation errors
    if (error instanceof TypeError || 
        error instanceof RangeError || 
        error instanceof SyntaxError) {
      return ErrorCategory.VALIDATION;
    }
    
    // Not found errors
    if (error?.message?.includes('not found') || 
        error?.message?.includes('does not exist')) {
      return ErrorCategory.NOT_FOUND;
    }
    
    return ErrorCategory.UNKNOWN;
  }
  
  /**
   * Extract relevant details from error object
   */
  private static extractErrorDetails(error: any): any {
    if (!error) return undefined;
    
    // Supabase error
    if (error.details || error.hint || error.message) {
      return {
        details: error.details,
        hint: error.hint,
        message: error.message
      };
    }
    
    return undefined;
  }
  
  /**
   * Get user-friendly message based on error category
   */
  private static getUserFriendlyMessage(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.VALIDATION:
        return 'Os dados fornecidos são inválidos.';
      case ErrorCategory.DATABASE:
        return 'Ocorreu um erro ao acessar o banco de dados.';
      case ErrorCategory.AUTHENTICATION:
        return 'É necessário estar autenticado para realizar esta ação.';
      case ErrorCategory.AUTHORIZATION:
        return 'Você não tem permissão para realizar esta ação.';
      case ErrorCategory.NETWORK:
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      case ErrorCategory.NOT_FOUND:
        return 'O recurso solicitado não foi encontrado.';
      case ErrorCategory.BUSINESS_LOGIC:
        return 'Não foi possível completar a operação.';
      default:
        return 'Ocorreu um erro inesperado.';
    }
  }
  
  /**
   * Get toast description based on error category
   */
  private static getToastDescription(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.VALIDATION:
        return 'Verifique os dados e tente novamente.';
      case ErrorCategory.DATABASE:
        return 'Tente novamente mais tarde.';
      case ErrorCategory.AUTHENTICATION:
        return 'Faça login para continuar.';
      case ErrorCategory.AUTHORIZATION:
        return 'Contate o administrador se acreditar que isso é um erro.';
      case ErrorCategory.NETWORK:
        return 'Verifique sua conexão e tente novamente.';
      case ErrorCategory.NOT_FOUND:
        return 'Verifique os dados ou tente novamente mais tarde.';
      case ErrorCategory.BUSINESS_LOGIC:
        return 'Tente novamente ou contate o suporte.';
      default:
        return 'Tente novamente mais tarde.';
    }
  }
  
  /**
   * Execute a function with standardized error handling
   */
  static async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    options: ErrorHandlingOptions = { 
      showToast: true, 
      logToConsole: true, 
      rethrow: false 
    }
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await operation();
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<T>(error, context, options);
    }
  }
}
