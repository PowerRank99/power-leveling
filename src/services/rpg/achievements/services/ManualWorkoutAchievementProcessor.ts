
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Service for processing manual workout related achievements
 */
export class ManualWorkoutAchievementProcessor {
  /**
   * Process manual workout for achievements
   */
  static async processManualWorkout(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get user manual workout count
        const { count, error } = await supabase
          .from('manual_workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (error) throw error;
        
        // Get manual workout achievements from database
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'manual')
          .order('requirements->count', { ascending: true });
          
        if (achievementsError) throw achievementsError;
        
        // Determine which achievements have been unlocked
        const unlockedAchievementIds = achievements
          .filter(achievement => {
            const requiredCount = achievement.requirements?.count || 0;
            return count && count >= requiredCount;
          })
          .map(achievement => achievement.id);
        
        // Award achievements
        if (unlockedAchievementIds.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, unlockedAchievementIds);
        }
        
        return unlockedAchievementIds;
      },
      'PROCESS_MANUAL_WORKOUT',
      { showToast: false }
    );
  }
  
  /**
   * Legacy method for backward compatibility
   */
  static async checkManualAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.processManualWorkout(userId);
  }
}
