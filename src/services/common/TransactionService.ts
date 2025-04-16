
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, ErrorCategory, createErrorResponse } from './ErrorHandlingService';

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
          return createErrorResponse(
            errorMessage,
            error instanceof Error ? error.message : String(error),
            ErrorCategory.DATABASE,
            error
          );
        }
        
        console.warn(`[TransactionService] ${operationName} attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
      }
    }
    
    return createErrorResponse(
      `${errorMessage} - max retries exceeded`,
      'Max retries exceeded',
      ErrorCategory.DATABASE
    );
  }

  /**
   * Execute a function within a transaction
   * Note: This requires Supabase functions for begin/commit/rollback transaction
   */
  static async executeInTransaction<T>(
    operation: () => Promise<T>,
    operationName: string = 'transaction'
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
