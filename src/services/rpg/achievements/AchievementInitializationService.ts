
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementProgressService } from './AchievementProgressService';
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';

/**
 * Service for initializing achievement progress
 */
export class AchievementInitializationService {
  /**
   * Initialize progress tracking for incremental achievements
   * Call this when a user first logs in or when new achievements are added
   */
  static async initializeAchievementProgress(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get all achievements that need progress tracking
        const { data: achievements, error } = await supabase
          .from('achievements')
          .select('*')
          .or('category.eq.workout,category.eq.streak,category.eq.record');
          
        if (error) {
          throw error;
        }
        
        if (!achievements || achievements.length === 0) {
          return;
        }
        
        // Map the DB achievements to the Achievement type
        const mappedAchievements = achievements.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          category: a.category,
          rank: a.rank,
          points: a.points,
          xpReward: a.xp_reward,
          iconName: a.icon_name,
          requirements: typeof a.requirements === 'string' 
            ? JSON.parse(a.requirements) 
            : a.requirements
        })) as Achievement[];
        
        // Initialize progress for each achievement
        await AchievementProgressService.initializeMultipleProgress(userId, mappedAchievements);
      },
      'INITIALIZE_ACHIEVEMENT_PROGRESS',
      {
        showToast: false
      }
    );
  }
}
