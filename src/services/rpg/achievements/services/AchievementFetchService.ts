
import { ServiceResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { AchievementRepository } from '../AchievementRepository';

export class AchievementFetchService {
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementRepository.getAllAchievements();
  }

  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementRepository.getUnlockedAchievements(userId);
  }

  static async getAchievementById(achievementId: string): Promise<ServiceResponse<Achievement | null>> {
    return AchievementRepository.getAchievementById(achievementId);
  }

  static async getAchievementByStringId(stringId: string): Promise<ServiceResponse<Achievement | null>> {
    return AchievementRepository.getAchievementByStringId(stringId);
  }
}
