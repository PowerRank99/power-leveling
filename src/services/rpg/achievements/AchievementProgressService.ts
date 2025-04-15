
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementProgress } from '@/types/achievementTypes';

export class AchievementProgressService {
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
      
      return createSuccessResponse(data || null);
    } catch (error) {
      return createErrorResponse(
        'Failed to get achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
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
  
  static async updateStreakProgress(userId: string, currentStreak: number): Promise<ServiceResponse<boolean>> {
    try {
      // Get streak achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, requirements')
        .eq('category', 'streak')
        .order('requirements->days', { ascending: true });
        
      if (error) throw error;
      
      // Update progress for each streak achievement
      for (const achievement of achievements) {
        const requiredDays = achievement.requirements?.days || 0;
        const isComplete = currentStreak >= requiredDays;
        
        await this.updateProgress(
          userId,
          achievement.id,
          currentStreak,
          requiredDays,
          isComplete
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update streak progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  static async updatePersonalRecordProgress(userId: string, recordCount: number): Promise<ServiceResponse<boolean>> {
    try {
      // Get personal record achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, requirements')
        .eq('category', 'record')
        .order('requirements->count', { ascending: true });
        
      if (error) throw error;
      
      // Update progress for each record achievement
      for (const achievement of achievements) {
        const requiredCount = achievement.requirements?.count || 0;
        const isComplete = recordCount >= requiredCount;
        
        await this.updateProgress(
          userId,
          achievement.id,
          recordCount,
          requiredCount,
          isComplete
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update personal record progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<AchievementProgress | null>> {
    return this.getProgress(userId, achievementId);
  }
}
