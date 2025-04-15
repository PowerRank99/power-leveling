import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementProgress } from '@/types/achievementTypes';

export class AchievementProgressService {
  /**
   * Update progress for an achievement
   */
  static async updateProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check if a progress entry already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('achievement_progress')
        .select('id, is_complete, current_value')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If already complete, don't update
      if (existingProgress?.is_complete && !isComplete) {
        return createSuccessResponse(true);
      }
      
      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('achievement_progress')
          .update({
            current_value: currentValue,
            target_value: targetValue,
            is_complete: isComplete,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new progress entry
        const { error: insertError } = await supabase
          .from('achievement_progress')
          .insert({
            user_id: userId,
            achievement_id: achievementId,
            current_value: currentValue,
            target_value: targetValue,
            is_complete: isComplete
          });
          
        if (insertError) throw insertError;
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Check if a user has unlocked an achievement
   */
  static async hasUnlockedAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { count, error } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId);
        
      if (error) throw error;
      
      return createSuccessResponse(count !== null && count > 0);
    } catch (error) {
      return createErrorResponse(
        'Failed to check achievement status',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievement progress
   */
  static async getProgress(userId: string, achievementId: string): Promise<ServiceResponse<AchievementProgress | null>> {
    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .select(`
          id,
          achievement_id,
          current_value,
          target_value,
          is_complete,
          updated_at
        `)
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data) return createSuccessResponse(null);
      
      // Transform to match AchievementProgress type
      const progress: AchievementProgress = {
        id: data.id,
        current: data.current_value,
        total: data.target_value,
        isComplete: data.is_complete
      };
      
      return createSuccessResponse(progress);
    } catch (error) {
      return createErrorResponse(
        'Failed to get achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Update multiple achievement progress values
   */
  static async updateMultipleProgressValues(
    userId: string,
    progressUpdates: Array<{
      achievementId: string,
      currentValue: number,
      targetValue: number,
      isComplete: boolean
    }>
  ): Promise<ServiceResponse<boolean>> {
    try {
      for (const update of progressUpdates) {
        const result = await this.updateProgress(
          userId,
          update.achievementId,
          update.currentValue,
          update.targetValue,
          update.isComplete
        );
        
        if (!result.success) {
          throw new Error(`Failed to update progress for achievement ${update.achievementId}: ${result.message}`);
        }
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update multiple achievement progress values',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Initialize multiple achievement progress entries
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: any[]
  ): Promise<ServiceResponse<boolean>> {
    // Delegate to the AchievementProgressFacade
    const { AchievementProgressFacade } = await import('./AchievementProgressFacade');
    return AchievementProgressFacade.initializeMultipleProgress(userId, achievements);
  }
  
  /**
   * Update streak progress
   */
  static async updateStreakProgress(userId: string, currentStreak: number): Promise<ServiceResponse<boolean>> {
    // Delegate to the AchievementProgressFacade
    const { AchievementProgressFacade } = await import('./AchievementProgressFacade');
    return AchievementProgressFacade.updateStreakProgress(userId, currentStreak);
  }
  
  /**
   * Update workout count progress
   */
  static async updateWorkoutCountProgress(userId: string, workoutCount: number): Promise<ServiceResponse<boolean>> {
    // Delegate to the AchievementProgressFacade
    const { AchievementProgressFacade } = await import('./AchievementProgressFacade');
    return AchievementProgressFacade.updateWorkoutCountProgress(userId, workoutCount);
  }
  
  /**
   * Update personal record progress
   */
  static async updatePersonalRecordProgress(userId: string, recordCount: number): Promise<ServiceResponse<boolean>> {
    // Delegate to the AchievementProgressFacade
    const { AchievementProgressFacade } = await import('./AchievementProgressFacade');
    return AchievementProgressFacade.updatePersonalRecordProgress(userId, recordCount);
  }
  
  /**
   * Get achievement progress by ID
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<AchievementProgress | null>> {
    return this.getProgress(userId, achievementId);
  }
}
