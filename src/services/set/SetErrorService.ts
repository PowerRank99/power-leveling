
import { toast } from 'sonner';

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
}
