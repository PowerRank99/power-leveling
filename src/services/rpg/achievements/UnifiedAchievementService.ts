
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { AchievementIdentifierService } from './AchievementIdentifierService';
import { AchievementFetchService } from './services/AchievementFetchService';
import { AchievementAwardService } from './services/AchievementAwardService';
import { AchievementProgressService } from './AchievementProgressService';

export class UnifiedAchievementService {
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getAllAchievements();
  }

  static async getAchievement(idOrStringId: string): Promise<ServiceResponse<Achievement | null>> {
    // First try directly as UUID
    const directResult = await AchievementFetchService.getAchievementById(idOrStringId);
    
    if (directResult.success && directResult.data) {
      return directResult;
    }
    
    // If not found as UUID, try as string ID
    return AchievementFetchService.getAchievementByStringId(idOrStringId);
  }

  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getUnlockedAchievements(userId);
  }

  static async hasUnlockedAchievement(userId: string, idOrStringId: string): Promise<ServiceResponse<boolean>> {
    const idResult = await this.resolveAchievementId(idOrStringId);
    if (!idResult.success) return createErrorResponse(
      'Achievement not found',
      `No achievement found with ID: ${idOrStringId}`,
      ErrorCategory.NOT_FOUND
    );

    const achievementId = idResult.data;
    return AchievementProgressService.hasUnlockedAchievement(userId, achievementId);
  }

  static async awardAchievement(userId: string, idOrStringId: string): Promise<ServiceResponse<boolean>> {
    const idResult = await this.resolveAchievementId(idOrStringId);
    if (!idResult.success) return createErrorResponse(
      'Achievement not found',
      `No achievement found with ID: ${idOrStringId}`,
      ErrorCategory.NOT_FOUND
    );

    const achievementId = idResult.data;
    return AchievementAwardService.awardAchievement(userId, achievementId);
  }

  static async updateAchievementProgress(
    userId: string,
    idOrStringId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    const idResult = await this.resolveAchievementId(idOrStringId);
    if (!idResult.success) return createErrorResponse(
      'Achievement not found',
      `No achievement found with ID: ${idOrStringId}`,
      ErrorCategory.NOT_FOUND
    );

    const achievementId = idResult.data;
    return AchievementProgressService.updateProgress(userId, achievementId, currentValue, targetValue, isComplete);
  }

  static async getAchievementProgress(
    userId: string,
    idOrStringId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    const idResult = await this.resolveAchievementId(idOrStringId);
    if (!idResult.success) return createErrorResponse(
      'Achievement not found',
      `No achievement found with ID: ${idOrStringId}`,
      ErrorCategory.NOT_FOUND
    );

    const achievementId = idResult.data;
    return AchievementProgressService.getProgress(userId, achievementId);
  }

  private static async resolveAchievementId(idOrStringId: string): Promise<ServiceResponse<string>> {
    // First check if it's a UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrStringId)) {
      return createSuccessResponse(idOrStringId);
    }

    // If not a UUID, try to get UUID from string ID
    const result = await AchievementIdentifierService.getIdByStringId(idOrStringId);
    if (!result.success) {
      return createErrorResponse(
        'Achievement not found',
        `No achievement found with string ID: ${idOrStringId}`,
        ErrorCategory.NOT_FOUND
      );
    }

    return createSuccessResponse(result.data);
  }
}
