
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { TransactionService } from '@/services/common/TransactionService';

/**
 * Service specifically for checking workout-related achievements
 */
export class WorkoutCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        // Get user's workout stats
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('workouts_count, streak')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) throw profileError;
        if (!profile) throw new Error('Profile not found');
        
        // Get workout achievements from database
        const { data: workoutAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'workout')
          .order('requirements->count', { ascending: true });
          
        if (achievementsError) throw achievementsError;

        const awardedAchievements: string[] = [];

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Check each achievement's requirements
            workoutAchievements.forEach(achievement => {
              const requiredCount = achievement.requirements?.count || 0;
              if (profile.workouts_count >= requiredCount) {
                awardedAchievements.push(achievement.id);
              }
            });
            
            // Update workout count progress
            // Just pass the current count and an appropriate target
            if (profile.workouts_count > 0) {
              await AchievementService.updateAchievementProgress(
                userId,
                'workout-count-achievement', // achievementId
                profile.workouts_count,      // currentValue
                Math.max(profile.workouts_count + 5, 10), // targetValue
                false                        // isComplete
              );
            }
            
            // Award achievements
            if (awardedAchievements.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, awardedAchievements);
            }
          }, 
          'workout_achievements', 
          3,
          'Failed to check workout achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Static method to check workout-related achievements
   */
  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const checker = new WorkoutCheckerService();
    return checker.checkAchievements(userId);
  }
}
