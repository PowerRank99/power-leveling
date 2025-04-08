
import { toast } from 'sonner';

/**
 * Service responsible for handling errors in set operations
 */
export class SetErrorService {
  /**
   * Handles error display to the user
   */
  static displayError(operation: string, error: any): void {
    console.error(`[SetErrorService] Error during ${operation}:`, error);
    
    toast.error(`Erro ao ${operation}`, {
      description: "Ocorreu um problema. Tente novamente."
    });
  }
}
