import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementStats } from '@/types/achievementTypes';
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
  static async getAchievements(userId: string): Promise<Achievement[]> {
    try {
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
      const progressMap = await AchievementProgressService.getAllProgress(userId);

      // Map and merge the data
      const achievementsWithStatus = achievements.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
        const parsedRequirements = typeof achievement.requirements === 'string' 
          ? JSON.parse(achievement.requirements as string) 
          : achievement.requirements;
          
        // Get progress for this achievement
        const progress = progressMap[achievement.id];

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
          progress: progress
        };
      });

      return achievementsWithStatus;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  /**
   * Get only unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<Achievement[]> {
    try {
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

      // Map the data to our Achievement type
      const achievements: Achievement[] = data.map(item => {
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
      });

      return achievements;
    } catch (error) {
      console.error('Error fetching unlocked achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<AchievementStats> {
    try {
      // Get total achievements count
      const { count: totalCount, error: totalError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get unlocked achievements count
      const { count: unlockedCount, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (unlockedError) throw unlockedError;

      // Get user profile for points and level
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('achievements_count, level')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Use achievements_count as points
      const points = profileData?.achievements_count || 0;
      const level = profileData?.level || 1;
      
      // Calculate rank score using the formula: 1.5 × Level + 2 × (Achievement Points)
      const rankScore = AchievementCheckerService.calculateRankScore(level, points);
      const rank = AchievementCheckerService.determineRank(rankScore);
      const nextRank = this.getNextRank(rank);
      const pointsToNextRank = this.getPointsToNextRank(points, rank);

      return {
        total: totalCount || 0,
        unlocked: unlockedCount || 0,
        points,
        rank,
        nextRank,
        pointsToNextRank
      };
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      return {
        total: 0,
        unlocked: 0,
        points: 0,
        rank: 'Unranked',
        nextRank: 'E',
        pointsToNextRank: 10
      };
    }
  }

  /**
   * Award an achievement to a user with transaction support
   * Ensures achievement and XP are awarded atomically
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
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
        await XPService.awardXP(userId, achievement.xp_reward, 'achievement');

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
        console.error('Error in achievement transaction:', transactionError);
        return false;
      }

      return success || false;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }

  /**
   * Check and award multiple achievements with retry support
   * Uses executeWithRetry for better reliability
   */
  static async checkAndAwardAchievements(
    userId: string, 
    achievementIds: string[]
  ): Promise<{ successful: string[], failed: string[] }> {
    const results = {
      successful: [] as string[],
      failed: [] as string[]
    };

    for (const achievementId of achievementIds) {
      const { data: success, error } = await TransactionService.executeWithRetry(
        async () => await this.awardAchievement(userId, achievementId)
      );

      if (success) {
        results.successful.push(achievementId);
      } else {
        console.error(`Failed to award achievement ${achievementId}:`, error);
        results.failed.push(achievementId);
      }
    }

    return results;
  }

  /**
   * Check workout achievements
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<void> {
    try {
      // Use the unified achievement checker service with retry support
      await TransactionService.executeWithRetry(
        async () => await AchievementCheckerService.checkWorkoutRelatedAchievements(userId)
      );
    } catch (error) {
      console.error('Error checking workout achievements:', error);
    }
  }

  /**
   * Get next rank based on current rank
   */
  private static getNextRank(currentRank: string): string | null {
    switch (currentRank) {
      case 'Unranked': return 'E';
      case 'E': return 'D';
      case 'D': return 'C';
      case 'C': return 'B';
      case 'B': return 'A';
      case 'A': return 'S';
      case 'S': return null; // Max rank
      default: return 'E';
    }
  }

  /**
   * Get points needed to reach next rank
   */
  private static getPointsToNextRank(currentPoints: number, currentRank: string): number | null {
    switch (currentRank) {
      case 'Unranked': return 10 - currentPoints;
      case 'E': return 50 - currentPoints;
      case 'D': return 100 - currentPoints;
      case 'C': return 250 - currentPoints;
      case 'B': return 500 - currentPoints;
      case 'A': return 1000 - currentPoints;
      case 'S': return null; // Max rank
      default: return 10 - currentPoints;
    }
  }

  /**
   * Initialize progress tracking for incremental achievements
   * Call this when a user first logs in or when new achievements are added
   */
  static async initializeAchievementProgress(userId: string): Promise<void> {
    try {
      // Get all achievements that need progress tracking
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .or('category.eq.workout,category.eq.streak,category.eq.record');
        
      if (error) {
        console.error('Error fetching achievements for initialization:', error);
        return;
      }
      
      // Initialize progress for each achievement
      await AchievementProgressService.initializeMultipleProgress(userId, achievements);
    } catch (error) {
      console.error('Error initializing achievement progress:', error);
    }
  }
}
