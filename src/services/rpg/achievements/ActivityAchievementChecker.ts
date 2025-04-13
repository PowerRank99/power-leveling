
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';

/**
 * Checker for activity variety and type achievements
 */
export class ActivityAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check activity variety achievements
   * Implementation of abstract method from BaseAchievementChecker
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Count unique exercise types in the last 7 days
        const { data: exerciseTypes, error: typesError } = await supabase
          .from('workout_sets')
          .select('exercise_id')
          .eq('user_id', userId)
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .is('completed', true);
          
        if (typesError) throw typesError;

        // Count unique exercise IDs
        const uniqueExerciseIds = exerciseTypes?.map(et => et.exercise_id).filter(Boolean) || [];
        const uniqueTypes = new Set(uniqueExerciseIds);
        const uniqueCount = uniqueTypes.size;

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Award activity variety achievements
            const achievementChecks: string[] = [];
            
            if (uniqueCount >= 3) achievementChecks.push('variety-3');
            if (uniqueCount >= 5) achievementChecks.push('variety-5');
            if (uniqueCount >= 10) achievementChecks.push('variety-10');
            
            // Check all achievements in batch
            if (achievementChecks.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
            }
          }, 
          'activity_variety_achievements', 
          3,
          'Failed to check activity variety achievements'
        );
      },
      'CHECK_VARIETY_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(userId: string, data?: any): Promise<ServiceResponse<void>> {
    return ActivityAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get count of manual workouts
        const { count: manualCount, error: manualError } = await supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (manualError) throw manualError;

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Award manual workout milestone achievements  
            const achievementChecks: string[] = [];
            
            if (manualCount && manualCount >= 1) achievementChecks.push('manual-first');
            if (manualCount && manualCount >= 5) achievementChecks.push('manual-5');
            if (manualCount && manualCount >= 10) achievementChecks.push('manual-10');
            if (manualCount && manualCount >= 25) achievementChecks.push('manual-25');

            // Check all achievements in batch
            if (achievementChecks.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
            }
            
            // Check for distinct activity types
            const { data: activityData, error: activityError } = await supabase
              .from('manual_workouts')
              .select('activity_type')
              .eq('user_id', userId);
              
            if (activityError) throw activityError;

            // Count distinct activity types
            const activityTypes = (activityData || [])
              .map(workout => workout.activity_type)
              .filter(Boolean);
            const uniqueActivities = new Set(activityTypes);
            const uniqueCount = uniqueActivities.size;

            // Award activity variety achievements
            const varietyChecks: string[] = [];
            
            if (uniqueCount >= 3) varietyChecks.push('activity-variety-3');
            if (uniqueCount >= 5) varietyChecks.push('activity-variety-5');
            
            // Check all achievements in batch
            if (varietyChecks.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, varietyChecks);
            }
          }, 
          'manual_workout_achievements', 
          3,
          'Failed to check manual workout achievements'
        );
      },
      'CHECK_MANUAL_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
