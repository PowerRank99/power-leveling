
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { TransactionService } from '../../common/TransactionService';
import { AchievementService } from '../AchievementService';
import { toast } from 'sonner';

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
  ): Promise<AchievementProgress | null> {
    try {
      // Check if progress entry already exists using proper RPC function
      const { data: existing, error: checkError } = await supabase.rpc(
        'get_achievement_progress_by_id',
        { 
          p_user_id: userId,
          p_achievement_id: achievementId 
        }
      );
        
      if (checkError) {
        console.error('Error checking achievement progress:', checkError);
        return null;
      }
      
      // If progress entry already exists, return it
      if (existing && existing.length > 0) {
        const progressData = existing[0];
        return {
          id: progressData.id,
          current: progressData.current_value,
          total: progressData.target_value,
          isComplete: progressData.is_complete
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
      
      const { data, error } = await supabase
        .from('achievement_progress')
        .insert(progressData)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error initializing achievement progress:', error);
        return null;
      }
      
      return {
        id: data.id,
        current: data.current_value,
        total: data.target_value,
        isComplete: data.is_complete
      };
    } catch (error) {
      console.error('Error in initializeProgress:', error);
      return null;
    }
  }
  
  /**
   * Get progress for a specific achievement
   */
  static async getProgress(
    userId: string,
    achievementId: string
  ): Promise<AchievementProgress | null> {
    try {
      const { data, error } = await supabase.rpc(
        'get_achievement_progress_by_id',
        { 
          p_user_id: userId,
          p_achievement_id: achievementId 
        }
      );
        
      if (error) {
        console.error('Error fetching achievement progress:', error);
        return null;
      }
      
      if (!data || data.length === 0) return null;
      
      const progressData = data[0];
      return {
        id: progressData.id,
        current: progressData.current_value,
        total: progressData.target_value,
        isComplete: progressData.is_complete
      };
    } catch (error) {
      console.error('Error in getProgress:', error);
      return null;
    }
  }
  
  /**
   * Get progress for all achievements of a user
   * Uses the optimized database function
   */
  static async getAllProgress(userId: string): Promise<Record<string, AchievementProgress>> {
    try {
      const { data, error } = await supabase.rpc(
        'get_all_achievement_progress',
        { p_user_id: userId }
      );
        
      if (error) {
        console.error('Error fetching all achievement progress:', error);
        return {};
      }
      
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
    } catch (error) {
      console.error('Error in getAllProgress:', error);
      return {};
    }
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
  ): Promise<boolean> {
    try {
      // Get the achievement to check target value
      const { data: achievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .maybeSingle();
        
      if (!achievement) {
        console.error(`Achievement ${achievementId} not found`);
        return false;
      }
      
      // Execute with transaction support for reliability
      const { data: wasCompleted, error } = await TransactionService.executeTransaction(async () => {
        // Get current progress
        const { data: progressResults, error: progressError } = await supabase.rpc(
          'get_achievement_progress_by_id',
          { 
            p_user_id: userId,
            p_achievement_id: achievementId 
          }
        );
          
        if (progressError) {
          throw progressError;
        }
        
        const progress = progressResults && progressResults.length > 0 ? progressResults[0] : null;
        
        // Calculate new value
        let updatedValue: number;
        let targetValue: number;
        
        if (progress) {
          targetValue = progress.target_value;
          updatedValue = options.increment ? progress.current_value + newValue : newValue;
          
          // If already complete, don't update
          if (progress.is_complete) {
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
        if (progress) {
          const { error: updateError } = await supabase
            .from('achievement_progress')
            .update({
              current_value: updatedValue,
              is_complete: isComplete,
              updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);
            
          if (updateError) throw updateError;
        }
        
        // If achievement is complete and we should check completion, award it
        if (isComplete && options.checkCompletion) {
          await AchievementService.awardAchievement(userId, achievementId);
          return true;
        }
        
        return false;
      });
      
      if (error) {
        console.error('Error updating achievement progress:', error);
        return false;
      }
      
      return wasCompleted || false;
    } catch (error) {
      console.error('Error in updateProgress:', error);
      return false;
    }
  }
  
  /**
   * Reset progress for an achievement
   */
  static async resetProgress(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    try {
      const { data: progressResults, error: progressError } = await supabase.rpc(
        'get_achievement_progress_by_id',
        { 
          p_user_id: userId,
          p_achievement_id: achievementId 
        }
      );
      
      if (progressError) {
        console.error('Error finding achievement progress:', progressError);
        return false;
      }
      
      if (!progressResults || progressResults.length === 0) {
        // No progress to reset
        return true;
      }
      
      const progress = progressResults[0];
      
      const { error } = await supabase
        .from('achievement_progress')
        .update({
          current_value: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', progress.id);
        
      if (error) {
        console.error('Error resetting achievement progress:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in resetProgress:', error);
      return false;
    }
  }
  
  /**
   * Increment progress for an achievement by a specified amount
   * Returns true if the achievement was completed as a result of this update
   */
  static async incrementProgress(
    userId: string,
    achievementId: string,
    incrementAmount: number = 1
  ): Promise<boolean> {
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
  ): Promise<void> {
    try {
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
          console.error('Error in batch initialization:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing multiple achievement progress:', error);
    }
  }
  
  /**
   * Update workout count achievement progress
   * Uses a single database call to check all workout count achievements
   */
  static async updateWorkoutCountProgress(userId: string, totalCount: number): Promise<void> {
    try {
      // Workout count achievements
      const workoutAchievements = [
        { id: 'first-workout', target: 1 },
        { id: 'total-7', target: 7 },
        { id: 'total-10', target: 10 },
        { id: 'total-25', target: 25 },
        { id: 'total-50', target: 50 },
        { id: 'total-100', target: 100 },
        { id: 'total-200', target: 200 }
      ];
      
      // Prepare batch update data
      const progressUpdates = workoutAchievements.map(achievement => ({
        achievement_id: achievement.id,
        current_value: totalCount,
        target_value: achievement.target,
        is_complete: totalCount >= achievement.target
      }));
      
      // Use the batch update function
      await supabase.rpc('batch_update_achievement_progress', {
        p_user_id: userId,
        p_achievements: progressUpdates
      });
      
      // Check which achievements are now complete
      const completedAchievements = workoutAchievements
        .filter(achievement => totalCount >= achievement.target)
        .map(achievement => achievement.id);
        
      if (completedAchievements.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
      }
    } catch (error) {
      console.error('Error updating workout count achievements:', error);
    }
  }
  
  /**
   * Update personal record achievement progress
   * Uses a single database call to check all PR count achievements
   */
  static async updatePersonalRecordProgress(userId: string, totalCount: number): Promise<void> {
    try {
      // PR count achievements
      const prAchievements = [
        { id: 'pr-first', target: 1 },
        { id: 'pr-5', target: 5 },
        { id: 'pr-10', target: 10 },
        { id: 'pr-25', target: 25 },
        { id: 'pr-50', target: 50 }
      ];
      
      // Prepare batch update data
      const progressUpdates = prAchievements.map(achievement => ({
        achievement_id: achievement.id,
        current_value: totalCount,
        target_value: achievement.target,
        is_complete: totalCount >= achievement.target
      }));
      
      // Use the batch update function
      await supabase.rpc('batch_update_achievement_progress', {
        p_user_id: userId,
        p_achievements: progressUpdates
      });
      
      // Check which achievements are now complete
      const completedAchievements = prAchievements
        .filter(achievement => totalCount >= achievement.target)
        .map(achievement => achievement.id);
        
      if (completedAchievements.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
      }
    } catch (error) {
      console.error('Error updating PR count achievements:', error);
    }
  }
  
  /**
   * Update streak achievement progress
   * Uses a single database call to check all streak achievements
   */
  static async updateStreakProgress(userId: string, currentStreak: number): Promise<void> {
    try {
      // Streak achievements
      const streakAchievements = [
        { id: 'streak-3', target: 3 },
        { id: 'streak-7', target: 7 },
        { id: 'streak-14', target: 14 },
        { id: 'streak-30', target: 30 },
        { id: 'streak-60', target: 60 },
        { id: 'streak-100', target: 100 },
        { id: 'streak-365', target: 365 }
      ];
      
      // Prepare batch update data
      const progressUpdates = streakAchievements.map(achievement => ({
        achievement_id: achievement.id,
        current_value: currentStreak,
        target_value: achievement.target,
        is_complete: currentStreak >= achievement.target
      }));
      
      // Use the batch update function
      await supabase.rpc('batch_update_achievement_progress', {
        p_user_id: userId,
        p_achievements: progressUpdates
      });
      
      // Check which achievements are now complete
      const completedAchievements = streakAchievements
        .filter(achievement => currentStreak >= achievement.target)
        .map(achievement => achievement.id);
        
      if (completedAchievements.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
      }
    } catch (error) {
      console.error('Error updating streak achievements:', error);
    }
  }
}
