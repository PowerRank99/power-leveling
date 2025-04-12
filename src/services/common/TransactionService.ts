
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, ErrorCategory, createSuccessResponse, createErrorResponse } from './ErrorHandlingService';

/**
 * Options for retry operations
 */
interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
}

/**
 * Service for handling database transactions and retries
 */
export class TransactionService {
  /**
   * Default retry options
   */
  private static readonly DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxRetries: 3,
    delay: 1000,
    backoffMultiplier: 1.5
  };

  /**
   * Execute a function with database transaction safety
   */
  static async executeTransaction<T>(
    fn: () => Promise<T>,
    options: { errorMessage?: string; category?: ErrorCategory } = {}
  ): Promise<ServiceResponse<T>> {
    try {
      // Begin transaction (Note: Supabase doesn't directly support client-side transactions,
      // so we're wrapping the function execution in a try-catch for atomicity-like semantics)
      const result = await fn();
      return createSuccessResponse(result);
    } catch (error) {
      console.error('Transaction failed:', error);
      return createErrorResponse(
        options.errorMessage || 'Transaction failed',
        error instanceof Error ? error.message : String(error),
        options.category || ErrorCategory.DATABASE
      );
    }
  }

  /**
   * Execute a function with retry logic
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    errorMessage: string = 'Operation failed after retries',
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    // Merge default options with provided options
    const options: RetryOptions = {
      ...this.DEFAULT_RETRY_OPTIONS,
      maxRetries,
      ...retryOptions
    };
    
    let lastError: any;
    let attempt = 0;
    
    while (attempt < options.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;
        
        console.warn(`Retry attempt ${attempt}/${options.maxRetries} for ${operationName} failed:`, error);
        
        if (attempt < options.maxRetries) {
          // Calculate backoff delay
          const backoffDelay = options.delay * Math.pow(options.backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }
    
    console.error(`All ${options.maxRetries} retry attempts for ${operationName} failed.`);
    throw new Error(`${errorMessage}. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }
  
  /**
   * Execute a function with retry logic and standardized error handling
   */
  static async executeWithRetryAndErrorHandling<T>(
    fn: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    errorCode: string = 'RETRY_OPERATION_FAILED',
    options: { errorMessage?: string; errorCategory?: ErrorCategory } = {}
  ): Promise<ServiceResponse<T>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => this.executeWithRetry(fn, operationName, maxRetries, options.errorMessage),
      errorCode,
      { 
        userMessage: options.errorMessage,
        errorCategory: options.errorCategory
      }
    );
  }
}
