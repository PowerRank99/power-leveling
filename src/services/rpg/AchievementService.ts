
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementStats } from '@/types/achievementTypes';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { XPService } from './XPService';
import { AchievementCheckerService } from './achievements/AchievementCheckerService';
import { TransactionService } from '../common/TransactionService';
import { AchievementProgressService } from './achievements/AchievementProgressService';

/**
 * Service for managing achievements
 */
export class AchievementService {
  /**
   * Get all achievements for a user
   */
  static async getAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get all achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('rank', { ascending: false });

        if (achievementsError) throw achievementsError;

        // Get user's unlocked achievements
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id, achieved_at')
          .eq('user_id', userId);

        if (userAchievementsError) throw userAchievementsError;

        // Get achievement progress data
        const { data: progressMap, error: progressError } = await supabase
          .rpc('get_all_achievement_progress', { p_user_id: userId });
          
        if (progressError) throw progressError;

        // Map and merge the data
        const achievementsWithStatus: Achievement[] = achievements.map(achievement => {
          const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
          const parsedRequirements = typeof achievement.requirements === 'string' 
            ? JSON.parse(achievement.requirements as string) 
            : achievement.requirements;
            
          // Get progress for this achievement
          const progressData = progressMap && progressMap[achievement.id];
          const progress = progressData ? {
            id: progressData.id,
            current: progressData.current,
            total: progressData.total,
            isComplete: progressData.isComplete
          } : undefined;

          return {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            category: achievement.category,
            rank: achievement.rank,
            points: achievement.points,
            xpReward: achievement.xp_reward,
            iconName: achievement.icon_name,
            requirements: parsedRequirements as Record<string, any>,
            isUnlocked: !!userAchievement,
            achievedAt: userAchievement?.achieved_at,
            progress
          };
        });

        return achievementsWithStatus;
      },
      'GET_ACHIEVEMENTS'
    );
  }

  /**
   * Get only unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get user's unlocked achievements with their details
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            achievement_id,
            achieved_at,
            achievements (
              id,
              name,
              description,
              category,
              rank,
              points,
              xp_reward,
              icon_name,
              requirements
            )
          `)
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false });

        if (error) throw error;
        if (!data) return [];

        // Map the data to our Achievement type
        const achievements: Achievement[] = data.map(item => {
          if (!item.achievements) return null;
          
          const parsedRequirements = typeof item.achievements.requirements === 'string' 
            ? JSON.parse(item.achievements.requirements as string) 
            : item.achievements.requirements;

          return {
            id: item.achievements.id,
            name: item.achievements.name,
            description: item.achievements.description,
            category: item.achievements.category,
            rank: item.achievements.rank,
            points: item.achievements.points,
            xpReward: item.achievements.xp_reward,
            iconName: item.achievements.icon_name,
            requirements: parsedRequirements as Record<string, any>,
            isUnlocked: true,
            achievedAt: item.achieved_at
          };
        }).filter(Boolean) as Achievement[];

        return achievements;
      },
      'GET_UNLOCKED_ACHIEVEMENTS'
    );
  }

  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<AchievementStats>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Use the optimized stored procedure for stats
        const { data, error } = await supabase
          .rpc('get_achievement_stats', { p_user_id: userId });
          
        if (error) throw error;
        
        if (!data) {
          return {
            total: 0,
            unlocked: 0,
            points: 0,
            rank: 'Unranked',
            nextRank: 'E',
            pointsToNextRank: 10
          };
        }
        
        return {
          total: data.total || 0,
          unlocked: data.unlocked || 0,
          points: data.points || 0,
          rank: data.rank || 'Unranked',
          nextRank: data.nextRank,
          pointsToNextRank: data.pointsToNextRank
        };
      },
      'GET_ACHIEVEMENT_STATS'
    );
  }

  /**
   * Award an achievement to a user with transaction support
   * Ensures achievement and XP are awarded atomically
   */
  static async awardAchievement(
    userId: string, 
    achievementId: string
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // First check if the user already has this achievement
        const { count, error: checkError } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('achievement_id', achievementId);

        if (checkError) throw checkError;

        // If already awarded, return true
        if (count && count > 0) {
          return true;
        }

        // Get achievement details
        const { data: achievement, error: achievementError } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', achievementId)
          .single();

        if (achievementError) throw achievementError;
        if (!achievement) throw new Error(`Achievement ${achievementId} not found`);

        // Use transaction service to ensure atomic operation
        const { data: success, error: transactionError } = await TransactionService.executeTransaction(async () => {
          // 1. Add achievement to user_achievements
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievementId,
              achieved_at: new Date().toISOString()
            });

          if (insertError) throw insertError;

          // 2. Award XP to user
          const xpResult = await XPService.awardXP(userId, achievement.xp_reward, 'achievement');
          if (!xpResult) throw new Error('Failed to award XP');

          // 3. Update achievement count and points
          await supabase.rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'achievements_count',
            increment_amount: 1
          });
          
          // 4. Also update achievement_points
          await supabase.rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'achievement_points',
            increment_amount: achievement.points
          });
          
          // 5. Mark achievement progress as complete if it exists
          const { data: progress } = await supabase
            .from('achievement_progress')
            .select('id, target_value')
            .eq('user_id', userId)
            .eq('achievement_id', achievementId)
            .maybeSingle();
            
          if (progress) {
            await supabase
              .from('achievement_progress')
              .update({
                current_value: progress.target_value,
                is_complete: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', progress.id);
          }

          return true;
        });

        if (transactionError) {
          throw transactionError;
        }

        return success || false;
      },
      'AWARD_ACHIEVEMENT',
      {
        userMessage: 'Não foi possível conceder a conquista',
        showToast: false
      }
    );
  }

  /**
   * Check and award multiple achievements with retry support
   * Uses executeWithRetry for better reliability
   */
  static async checkAndAwardAchievements(
    userId: string, 
    achievementIds: string[]
  ): Promise<ServiceResponse<{ successful: string[], failed: string[] }>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!achievementIds.length) {
          return { successful: [], failed: [] };
        }
          
        // Use the optimized batch check function
        const { data, error } = await supabase.rpc(
          'check_achievement_batch',
          { 
            p_user_id: userId,
            p_achievement_ids: achievementIds 
          }
        );
        
        if (error) {
          // Fall back to individual checks if the batch function fails
          const results = {
            successful: [] as string[],
            failed: [] as string[]
          };

          for (const achievementId of achievementIds) {
            const { data: success, error } = await TransactionService.executeWithRetry(
              async () => await this.awardAchievement(userId, achievementId)
            );

            if (success?.success) {
              results.successful.push(achievementId);
            } else {
              console.error(`Failed to award achievement ${achievementId}:`, error);
              results.failed.push(achievementId);
            }
          }
          
          return results;
        }
          
        // Process the batch results
        const successful = data
          .filter(result => result.awarded)
          .map(result => result.achievement_id);
          
        const failed = achievementIds.filter(id => 
          !successful.includes(id)
        );
          
        return {
          successful,
          failed
        };
      },
      'CHECK_AND_AWARD_ACHIEVEMENTS',
      {
        showToast: false,
        userMessage: 'Erro ao verificar conquistas'
      }
    );
  }

  /**
   * Check workout achievements
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Use the unified achievement checker service with retry support
        await TransactionService.executeWithRetry(
          async () => await AchievementCheckerService.checkWorkoutRelatedAchievements(userId)
        );
      },
      'CHECK_WORKOUT_ACHIEVEMENTS',
      {
        showToast: false
      }
    );
  }

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
        
        // Initialize progress for each achievement
        await AchievementProgressService.initializeMultipleProgress(userId, achievements);
      },
      'INITIALIZE_ACHIEVEMENT_PROGRESS',
      {
        showToast: false
      }
    );
  }
}
