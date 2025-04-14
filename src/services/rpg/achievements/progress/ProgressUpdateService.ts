
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '@/services/common/TransactionService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { BaseProgressService } from './BaseProgressService';

/**
 * Service for updating achievement progress
 */
export class ProgressUpdateService extends BaseProgressService {
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
        const { data: wasCompleted, error } = await TransactionService.executeInTransaction(async () => {
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
}
