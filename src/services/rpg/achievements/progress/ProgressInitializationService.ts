
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { BaseProgressService } from './BaseProgressService';

/**
 * Service for initializing achievement progress
 */
export class ProgressInitializationService extends BaseProgressService {
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
}
