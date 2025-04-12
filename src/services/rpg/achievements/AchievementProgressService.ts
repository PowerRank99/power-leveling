
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
      // Check if progress entry already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // Not found error code
        console.error('Error checking achievement progress:', checkError);
        return null;
      }
      
      // If progress entry already exists, return it
      if (existingProgress) {
        return {
          id: existingProgress.id,
          current: existingProgress.current_value,
          total: existingProgress.target_value,
          isComplete: existingProgress.is_complete
        };
      }
      
      // Create new progress entry
      const { data: newProgress, error: insertError } = await supabase
        .from('achievement_progress')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          current_value: 0,
          target_value: targetValue,
          is_complete: false
        })
        .select('*')
        .single();
        
      if (insertError) {
        console.error('Error initializing achievement progress:', insertError);
        return null;
      }
      
      return {
        id: newProgress.id,
        current: newProgress.current_value,
        total: newProgress.target_value,
        isComplete: newProgress.is_complete
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
      const { data, error } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching achievement progress:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        current: data.current_value,
        total: data.target_value,
        isComplete: data.is_complete
      };
    } catch (error) {
      console.error('Error in getProgress:', error);
      return null;
    }
  }
  
  /**
   * Get progress for all achievements of a user
   */
  static async getAllProgress(userId: string): Promise<Record<string, AchievementProgress>> {
    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching all achievement progress:', error);
        return {};
      }
      
      const progressMap: Record<string, AchievementProgress> = {};
      
      data.forEach(item => {
        progressMap[item.achievement_id] = {
          id: item.id,
          current: item.current_value,
          total: item.target_value,
          isComplete: item.is_complete
        };
      });
      
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
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .maybeSingle();
        
      if (!achievements) {
        console.error(`Achievement ${achievementId} not found`);
        return false;
      }
      
      // Execute with transaction support for reliability
      const { data: wasCompleted, error } = await TransactionService.executeTransaction(async () => {
        // Get current progress
        const { data: progress, error: progressError } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
          
        if (progressError && progressError.code !== 'PGRST116') { // Not found error code
          throw progressError;
        }
        
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
          const requirements = typeof achievements.requirements === 'string' 
            ? JSON.parse(achievements.requirements) 
            : achievements.requirements;
            
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
      const { error } = await supabase
        .from('achievement_progress')
        .update({
          current_value: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId);
        
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
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: Achievement[]
  ): Promise<void> {
    try {
      for (const achievement of achievements) {
        const requirements = typeof achievement.requirements === 'string' 
          ? JSON.parse(achievement.requirements) 
          : achievement.requirements;
          
        const targetValue = requirements.count || requirements.target || 10;
        
        await this.initializeProgress(userId, achievement.id, targetValue);
      }
    } catch (error) {
      console.error('Error initializing multiple achievement progress:', error);
    }
  }
  
  /**
   * Update workout count achievement progress
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
      
      for (const achievement of workoutAchievements) {
        await this.updateProgress(userId, achievement.id, totalCount, {
          increment: false,
          checkCompletion: true
        });
      }
    } catch (error) {
      console.error('Error updating workout count achievements:', error);
    }
  }
  
  /**
   * Update personal record achievement progress
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
      
      for (const achievement of prAchievements) {
        await this.updateProgress(userId, achievement.id, totalCount, {
          increment: false,
          checkCompletion: true
        });
      }
    } catch (error) {
      console.error('Error updating PR count achievements:', error);
    }
  }
  
  /**
   * Update streak achievement progress
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
      
      for (const achievement of streakAchievements) {
        await this.updateProgress(userId, achievement.id, currentStreak, {
          increment: false,
          checkCompletion: true
        });
      }
    } catch (error) {
      console.error('Error updating streak achievements:', error);
    }
  }
}
