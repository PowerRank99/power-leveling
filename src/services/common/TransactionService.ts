
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Service for handling database transactions using Supabase
 * Provides methods to execute multiple database operations as a single atomic unit
 */
export class TransactionService {
  /**
   * Execute a function within a transaction
   * Automatically rolls back on error
   * 
   * @param transactionFunction Function containing database operations to execute in transaction
   * @returns Result of the transaction function or error
   */
  static async executeTransaction<T>(
    transactionFunction: () => Promise<T>
  ): Promise<{ data: T | null; error: PostgrestError | Error | null }> {
    try {
      // Start transaction
      const { error: beginError } = await supabase.rpc('begin_transaction');
      if (beginError) throw beginError;

      // Execute the transaction function
      const result = await transactionFunction();

      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) {
        // Attempt rollback if commit fails
        await supabase.rpc('rollback_transaction').catch(e => 
          console.error('Failed to rollback after commit error:', e)
        );
        throw commitError;
      }

      return { data: result, error: null };
    } catch (error) {
      // Rollback transaction on error
      await supabase.rpc('rollback_transaction').catch(e => 
        console.error('Failed to rollback transaction:', e)
      );
      
      console.error('Transaction error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown transaction error')
      };
    }
  }

  /**
   * Execute multiple database operations with automatic retry
   * Useful for non-transactional operations that still need reliability
   * 
   * @param operation Function containing database operations
   * @param maxRetries Maximum number of retry attempts
   * @returns Result of the operation or error
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<{ data: T | null; error: Error | null }> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxRetries) {
      try {
        const result = await operation();
        return { data: result, error: null };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error during retry operation');
        console.error(`Operation failed (attempt ${attempts + 1}/${maxRetries}):`, error);
        attempts++;
        
        // Add exponential backoff delay
        if (attempts < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempts), 8000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return { data: null, error: lastError };
  }
}
