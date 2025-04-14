
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';

/**
 * Abstract base class for all achievement checkers
 * Provides common methods and enforces a standard interface
 */
export abstract class BaseAchievementChecker {
  /**
   * Check achievements based on the implementation in derived classes
   * Must be implemented by all derived checker classes
   */
  abstract checkAchievements(userId: string, data?: any): Promise<ServiceResponse<void>>;
  
  /**
   * Executes the checker with error handling
   */
  async executeWithErrorHandling(userId: string, data?: any): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        await this.checkAchievements(userId, data);
      },
      'CHECK_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Create a successful response (helper method)
   */
  protected createSuccess(): ServiceResponse<void> {
    return createSuccessResponse(undefined);
  }
}
