
import { ServiceResponse, ErrorHandlingService, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

/**
 * Base class for achievement checker services
 */
export abstract class BaseAchievementService {
  /**
   * Common method for handling error reporting in achievement checkers
   */
  protected static handleAchievementError(error: any, operation: string): void {
    console.error(`[AchievementService] Error in ${operation}:`, error);
    // Just log the error without showing a toast
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
      `ACHIEVEMENT_${operation.toUpperCase()}`,
      { showToast: false }
    );
  }
}
