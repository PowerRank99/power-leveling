
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling database transactions
 */
export class TransactionService {
  /**
   * Execute a function with retry logic
   * 
   * @param fn The function to execute
   * @param lockKey A unique key to identify the transaction
   * @param maxRetries Maximum number of retries
   * @param errorMessage Custom error message on failure
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    lockKey: string,
    maxRetries: number = 3,
    errorMessage: string = 'Transaction failed'
  ): Promise<T> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        // Begin transaction
        await supabase.rpc('begin_transaction');
        
        // Execute the function
        const result = await fn();
        
        // Commit transaction
        await supabase.rpc('commit_transaction');
        
        return result;
      } catch (error) {
        // Rollback on error
        try {
          await supabase.rpc('rollback_transaction');
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
        
        retries++;
        
        if (retries >= maxRetries) {
          console.error(`${errorMessage} after ${maxRetries} attempts:`, error);
          throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
    
    throw new Error(`${errorMessage}: Max retries exceeded`);
  }
}
