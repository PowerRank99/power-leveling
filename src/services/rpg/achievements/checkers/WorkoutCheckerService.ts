
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { TransactionService } from '@/services/common/TransactionService';

export class WorkoutCheckerService extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        // Get user's workout stats
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('workouts_count')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) throw profileError;
        if (!profile) throw new Error('Profile not found');
        
        // Get workout achievements from database ordered by required count
        const { data: workoutAchievements, error: achievementsError } = await this.fetchAchievementsByCategory(
          'workout',
          'requirements->count'
        );
          
        if (achievementsError) throw achievementsError;
        if (!workoutAchievements) return [];

        const awardedAchievements: string[] = [];

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
            if (profile.workouts_count > 0) {
              await AchievementService.updateAchievementProgress(
                userId,
                'workout',
                profile.workouts_count,
                Math.max(profile.workouts_count + 5, 10),
                false // Required parameter for isComplete
              );
            }
            
            // Award achievements
            if (awardedAchievements.length > 0) {
              await this.awardAchievementsBatch(userId, awardedAchievements);
            }
          }, 
          'workout_achievements', 
          3,
          'Failed to check workout achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_WORKOUT_ACHIEVEMENTS'
    );
  }

  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const checker = new WorkoutCheckerService();
    return checker.checkAchievements(userId);
  }
}
