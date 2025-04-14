
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from './ErrorHandlingService';

/**
 * Service for handling database transactions
 */
export class TransactionService {
  /**
   * Execute a function with retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    errorMessage: string = 'Operation failed'
  ): Promise<ServiceResponse<T>> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        attempt++;
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        if (attempt >= maxRetries) {
          console.error(`[TransactionService] ${operationName} failed after ${maxRetries} attempts:`, error);
          return {
            success: false,
            message: errorMessage,
            error: error instanceof Error ? error : new Error(String(error))
          };
        }
        
        console.warn(`[TransactionService] ${operationName} attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
      }
    }
    
    return {
      success: false,
      message: `${errorMessage} - max retries exceeded`,
      error: new Error('Max retries exceeded')
    };
  }

  /**
   * Execute a function within a transaction
   * Note: This requires Supabase functions for begin/commit/rollback transaction
   */
  static async executeInTransaction<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResponse<T>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Begin transaction
        await supabase.rpc('begin_transaction');
        
        try {
          // Execute the operation
          const result = await operation();
          
          // Commit transaction
          await supabase.rpc('commit_transaction');
          
          return result;
        } catch (error) {
          // Rollback transaction on error
          await supabase.rpc('rollback_transaction');
          throw error;
        }
      },
      operationName
    );
  }
}
