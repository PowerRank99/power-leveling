
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementUtils } from '@/constants/AchievementDefinitions';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for processing manual workout achievements
 */
export class ManualWorkoutAchievementProcessor {
  /**
   * Process manual workout submission for achievements
   */
  static async processManualWorkout(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get manual workout count for the user
        const { count } = await supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        const manualCount = count || 0;
        
        // Get manual workout achievements from centralized definitions
        const manualAchievements = AchievementUtils
          .getAchievementsByCategory('manual')
          .filter(a => a.requirementType === 'manual_count')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Find achievements to award
        const achievementsToCheck: string[] = [];
        
        for (const achievement of manualAchievements) {
          if (manualCount >= achievement.requirementValue) {
            achievementsToCheck.push(achievement.id);
          }
        }
        
        // Award achievements
        if (achievementsToCheck.length > 0) {
          const result = await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
          if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [];
          }
        }
        
        return [];
      },
      'PROCESS_MANUAL_WORKOUT',
      { showToast: false }
    );
  }
}
