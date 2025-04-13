
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';

/**
 * Base class for achievement checker services
 */
export abstract class BaseAchievementService {
  /**
   * Common method for handling error reporting in achievement checkers
   */
  protected static handleAchievementError(error: any, operation: string): void {
    ErrorHandlingService.handleError(
      error,
      `Error in ${operation}`,
      { showToast: false }
    );
  }

  /**
   * Utility method to run achievement checks safely
   */
  protected static async safeExecute<T>(
    checkFn: () => Promise<T>,
    operation: string
  ): Promise<ServiceResponse<T>> {
    return ErrorHandlingService.executeWithErrorHandling(
      checkFn,
      operation,
      { showToast: false }
    );
  }
}
