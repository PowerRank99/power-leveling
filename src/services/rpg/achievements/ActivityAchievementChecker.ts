
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker, UserWorkoutStats, UserProfileData } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';

/**
 * Checker for achievements related to activity variety
 */
export class ActivityAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all activity variety related achievements
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        // Get user profile for achievement checks
        const userProfile = await this.getUserProfile(userId);
        if (!userProfile) throw new Error('User profile not found');
        
        // Check manually submitted workouts
        await this.checkManualWorkoutAchievements(userId);
        
        // Check activity variety
        await this.checkActivityVarietyAchievements(userId);
      },
      'CHECK_ACTIVITY_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityAchievementChecker.checkAchievements(userId);
  }
  
  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get count of manual workouts
        const { count, error } = await supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (error) throw error;
        
        const manualWorkoutCount = count || 0;
        
        // Use transaction service with retry for checking achievements
        await TransactionService.executeWithRetry(
          async () => {
            const achievementChecks = [];
            
            // Check for achievements based on manual workout count
            if (manualWorkoutCount >= 1) {
              achievementChecks.push('manual-workout-first');
            }
            if (manualWorkoutCount >= 3) {
              achievementChecks.push('manual-workout-3');
            }
            if (manualWorkoutCount >= 10) {
              achievementChecks.push('manual-workout-10');
            }
            if (manualWorkoutCount >= 25) {
              achievementChecks.push('manual-workout-25');
            }
            if (manualWorkoutCount >= 50) {
              achievementChecks.push('manual-workout-50');
            }
            if (manualWorkoutCount >= 100) {
              achievementChecks.push('manual-workout-100');
            }
            
            // Check all the achievements in batch if any were triggered
            if (achievementChecks.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
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
  
  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get distinct activity types for user
        const { data: activitiesData, error: activitiesError } = await supabase
          .rpc('get_distinct_activity_types', { user_id: userId });
          
        if (activitiesError) throw activitiesError;
        
        const activityTypes = activitiesData ? activitiesData.map((a: any) => a.activity_type) : [];
        const distinctActivityCount = activityTypes.length;
        
        // Get distinct exercise types in last 7 days
        const { data: exerciseData, error: exerciseError } = await supabase
          .rpc('count_distinct_exercise_types', { user_id: userId, days_back: 7 });
          
        if (exerciseError) throw exerciseError;
        
        const distinctExerciseTypes = exerciseData && exerciseData.length > 0 ? Number(exerciseData[0].type_count) : 0;
        
        // Use transaction service for better reliability
        await TransactionService.executeWithRetry(
          async () => {
            const achievementChecks = [];
            
            // Check for variety achievements
            if (distinctActivityCount >= 3) {
              achievementChecks.push('activity-variety-3');
            }
            if (distinctActivityCount >= 5) {
              achievementChecks.push('activity-variety-5');
            }
            if (distinctActivityCount >= 10) {
              achievementChecks.push('activity-variety-10');
            }
            
            // Check for exercise variety achievements
            if (distinctExerciseTypes >= 5) {
              achievementChecks.push('exercise-variety-5');
            }
            if (distinctExerciseTypes >= 10) {
              achievementChecks.push('exercise-variety-10');
            }
            if (distinctExerciseTypes >= 20) {
              achievementChecks.push('exercise-variety-20');
            }
            
            // Check for combo achievements (both activity types and exercise types)
            if (distinctActivityCount >= 3 && distinctExerciseTypes >= 5) {
              achievementChecks.push('fitness-explorer');
            }
            
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
      'CHECK_ACTIVITY_VARIETY_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
