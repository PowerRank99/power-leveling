
import { toast } from 'sonner';
import { ErrorFactory } from '../common/ErrorFactory';
import { ServiceResponse, ErrorCategory } from '../common/ErrorHandlingService';

/**
 * Service responsible for handling errors in set operations
 */
export class SetErrorService {
  /**
   * Displays a user-friendly error message for set operations
   */
  static displayError(operation: string, error: any): void {
    console.error(`[SetErrorService] Error during ${operation}:`, error);
    
    let errorMessage = "Não foi possível completar a operação";
    
    // Extract more specific error information if available
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.details) {
      errorMessage = error.details;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    toast.error(`Erro ao ${operation}`, {
      description: errorMessage,
      duration: 5000
    });
  }
  
  /**
   * Creates a standardized error response for set operations
   */
  static createSetError(operation: string, error: any): ServiceResponse<any> {
    const technical = error instanceof Error ? error.message : String(error);
    const message = `Erro ao ${operation}`;
    
    return ErrorFactory.createBusinessLogicError(
      message,
      technical,
      'SET_OPERATION_ERROR'
    );
  }
  
  /**
   * Handles set operation errors with standardized responses and optional toast
   */
  static handleSetError(operation: string, error: any, showToast: boolean = true): ServiceResponse<any> {
    // Get a standardized error response
    const errorResponse = this.createSetError(operation, error);
    
    // Optionally show toast
    if (showToast) {
      toast.error(errorResponse.message || '', {
        description: errorResponse.error?.message?.substring(0, 100), // Truncate long messages
        duration: 5000
      });
    }
    
    return errorResponse;
  }
}
