
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { TransactionService } from '../../common/TransactionService';
import { AchievementService } from '../AchievementService';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';

/**
 * Service for handling achievement progress tracking
 * Tracks incremental progress toward achievements and checks for completion
 */
export class AchievementProgressService {
  /**
   * Initialize progress tracking for an achievement
   * Creates a new progress entry if one doesn't exist
   */
  static async initializeProgress(
    userId: string,
    achievementId: string,
    targetValue: number
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Check if progress entry already exists
        const { data, error: checkError } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // If progress entry already exists, return it
        if (data) {
          return {
            id: data.id,
            current: data.current_value,
            total: data.target_value,
            isComplete: data.is_complete
          };
        }
        
        // Create new progress entry
        const progressData = {
          user_id: userId,
          achievement_id: achievementId,
          current_value: 0,
          target_value: targetValue,
          is_complete: false
        };
        
        const { data: newData, error } = await supabase
          .from('achievement_progress')
          .insert(progressData)
          .select('*')
          .single();
          
        if (error) throw error;
        
        return {
          id: newData.id,
          current: newData.current_value,
          total: newData.target_value,
          isComplete: newData.is_complete
        };
      },
      'INITIALIZE_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Get progress for a specific achievement
   */
  static async getProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) return null;
        
        return {
          id: data.id,
          current: data.current_value,
          total: data.target_value,
          isComplete: data.is_complete
        };
      },
      'GET_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Get progress for all achievements of a user
   * Uses the optimized database function
   */
  static async getAllProgress(userId: string): Promise<ServiceResponse<Record<string, AchievementProgress>>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase.rpc(
          'get_all_achievement_progress',
          { p_user_id: userId }
        );
          
        if (error) throw error;
        
        // Parse the JSON result into our expected format
        const progressMap: Record<string, AchievementProgress> = {};
        
        if (data) {
          Object.entries(data).forEach(([achievementId, progressData]: [string, any]) => {
            progressMap[achievementId] = {
              id: progressData.id,
              current: progressData.current,
              total: progressData.total,
              isComplete: progressData.isComplete
            };
          });
        }
        
        return progressMap;
      },
      'GET_ALL_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Update progress for an achievement
   * Returns true if the achievement was completed as a result of this update
   */
  static async updateProgress(
    userId: string,
    achievementId: string,
    newValue: number,
    options: {
      increment?: boolean;
      checkCompletion?: boolean;
    } = { increment: false, checkCompletion: true }
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get the achievement to check target value
        const { data: achievement } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', achievementId)
          .maybeSingle();
          
        if (!achievement) {
          throw new Error(`Achievement ${achievementId} not found`);
        }
        
        // Execute with transaction support for reliability
        const { data: wasCompleted, error } = await TransactionService.executeTransaction(async () => {
          // Get current progress
          const { data, error: progressError } = await supabase
            .from('achievement_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('achievement_id', achievementId)
            .maybeSingle();
            
          if (progressError) {
            throw progressError;
          }
          
          // Calculate new value
          let updatedValue: number;
          let targetValue: number;
          
          if (data) {
            targetValue = data.target_value;
            updatedValue = options.increment ? data.current_value + newValue : newValue;
            
            // If already complete, don't update
            if (data.is_complete) {
              return false;
            }
          } else {
            // Extract target value from achievement requirements
            const requirements = typeof achievement.requirements === 'string' 
              ? JSON.parse(achievement.requirements) 
              : achievement.requirements;
              
            targetValue = requirements.count || requirements.target || 10; // Default to 10 if not specified
            updatedValue = options.increment ? newValue : newValue;
            
            // Create new progress entry
            const { error: insertError } = await supabase
              .from('achievement_progress')
              .insert({
                user_id: userId,
                achievement_id: achievementId,
                current_value: updatedValue,
                target_value: targetValue,
                is_complete: false
              });
              
            if (insertError) throw insertError;
          }
          
          // Check if achievement is now complete
          const isComplete = updatedValue >= targetValue;
          
          // Update progress
          if (data) {
            const { error: updateError } = await supabase
              .from('achievement_progress')
              .update({
                current_value: updatedValue,
                is_complete: isComplete,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.id);
              
            if (updateError) throw updateError;
          }
          
          // If achievement is complete and we should check completion, award it
          if (isComplete && options.checkCompletion) {
            const awardResult = await AchievementService.awardAchievement(userId, achievementId);
            return awardResult.success;
          }
          
          return false;
        });
        
        if (error) {
          throw error;
        }
        
        return wasCompleted || false;
      },
      'UPDATE_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Reset progress for an achievement
   */
  static async resetProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error: progressError } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
        
        if (progressError) {
          throw progressError;
        }
        
        if (!data) {
          // No progress to reset
          return true;
        }
        
        const { error } = await supabase
          .from('achievement_progress')
          .update({
            current_value: 0,
            is_complete: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
          
        if (error) {
          throw error;
        }
        
        return true;
      },
      'RESET_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Increment progress for an achievement by a specified amount
   * Returns true if the achievement was completed as a result of this update
   */
  static async incrementProgress(
    userId: string,
    achievementId: string,
    incrementAmount: number = 1
  ): Promise<ServiceResponse<boolean>> {
    return this.updateProgress(userId, achievementId, incrementAmount, {
      increment: true,
      checkCompletion: true
    });
  }
  
  /**
   * Initialize progress for multiple achievements
   * Uses batching for better performance
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: Achievement[]
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!achievements || achievements.length === 0) {
          return;
        }
        
        // Create batches of 10 achievements each
        const batchSize = 10;
        const batches = [];
        
        for (let i = 0; i < achievements.length; i += batchSize) {
          batches.push(achievements.slice(i, i + batchSize));
        }
        
        // Process each batch
        for (const batch of batches) {
          const progressUpdates = batch.map(achievement => {
            const requirements = typeof achievement.requirements === 'string'
              ? JSON.parse(achievement.requirements)
              : achievement.requirements;
              
            const targetValue = requirements.count || requirements.target || 10;
            
            return {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: 0,
              target_value: targetValue,
              is_complete: false
            };
          });
          
          // Use a batch insert with conflict handling
          const { error } = await supabase
            .from('achievement_progress')
            .upsert(progressUpdates, { 
              onConflict: 'user_id,achievement_id',
              ignoreDuplicates: true
            });
            
          if (error) {
            throw error;
          }
        }
      },
      'INITIALIZE_MULTIPLE_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Update workout count achievement progress
   * Uses the optimized batch update function
   */
  static async updateWorkoutCountProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Workout count achievements with their targets
        const workoutAchievements = [
          { id: 'first-workout', target: 1 },
          { id: 'total-7', target: 7 },
          { id: 'total-10', target: 10 },
          { id: 'total-25', target: 25 },
          { id: 'total-50', target: 50 },
          { id: 'total-100', target: 100 },
          { id: 'total-200', target: 200 }
        ];
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = JSON.stringify(workoutAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: totalCount,
          target_value: achievement.target,
          is_complete: totalCount >= achievement.target
        })));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressUpdates
        });
        
        if (error) {
          throw error;
        }
        
        // Check which achievements are now complete
        const completedAchievements = workoutAchievements
          .filter(achievement => totalCount >= achievement.target)
          .map(achievement => achievement.id);
          
        if (completedAchievements.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
        }
      },
      'UPDATE_WORKOUT_COUNT_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Update personal record achievement progress
   * Uses the batch update function
   */
  static async updatePersonalRecordProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // PR count achievements with their targets
        const prAchievements = [
          { id: 'pr-first', target: 1 },
          { id: 'pr-5', target: 5 },
          { id: 'pr-10', target: 10 },
          { id: 'pr-25', target: 25 },
          { id: 'pr-50', target: 50 }
        ];
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = JSON.stringify(prAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: totalCount,
          target_value: achievement.target,
          is_complete: totalCount >= achievement.target
        })));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressUpdates
        });
        
        if (error) {
          throw error;
        }
        
        // Check which achievements are now complete
        const completedAchievements = prAchievements
          .filter(achievement => totalCount >= achievement.target)
          .map(achievement => achievement.id);
          
        if (completedAchievements.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
        }
      },
      'UPDATE_PR_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Update streak achievement progress
   * Uses the batch update function
   */
  static async updateStreakProgress(
    userId: string, 
    currentStreak: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Streak achievements with their targets
        const streakAchievements = [
          { id: 'streak-3', target: 3 },
          { id: 'streak-7', target: 7 },
          { id: 'streak-14', target: 14 },
          { id: 'streak-30', target: 30 },
          { id: 'streak-60', target: 60 },
          { id: 'streak-100', target: 100 },
          { id: 'streak-365', target: 365 }
        ];
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = JSON.stringify(streakAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: currentStreak,
          target_value: achievement.target,
          is_complete: currentStreak >= achievement.target
        })));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressUpdates
        });
        
        if (error) {
          throw error;
        }
        
        // Check which achievements are now complete
        const completedAchievements = streakAchievements
          .filter(achievement => currentStreak >= achievement.target)
          .map(achievement => achievement.id);
          
        if (completedAchievements.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
        }
      },
      'UPDATE_STREAK_PROGRESS',
      { showToast: false }
    );
  }
}
