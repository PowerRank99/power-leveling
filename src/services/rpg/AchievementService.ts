
import { Achievement, AchievementStats } from './achievement/types';
import { AchievementCheckService } from './achievement/AchievementCheckService';
import { AchievementQueryService } from './achievement/AchievementQueryService';
import { FirstAchievementService } from './achievement/FirstAchievementService';
import { RankService } from './RankService';
import { supabase } from '@/integrations/supabase/client';

export class AchievementService {
  static checkAchievements = AchievementCheckService.checkAchievements;
  static tryAwardFirstWorkoutAchievement = FirstAchievementService.tryAwardFirstWorkoutAchievement;
  static getAllAchievements = AchievementQueryService.getAllAchievements;
  static getAchievementsByCategory = AchievementQueryService.getAchievementsByCategory;
  static getAchievementsByRank = AchievementQueryService.getAchievementsByRank;
  static getAchievementStats = AchievementQueryService.getAchievementStats;

  static async getAchievementCountByRank(userId: string): Promise<Record<string, { total: number; unlocked: number }>> {
    try {
      // Fetch all achievements grouped by rank
      const { data: achievementsByRank, error } = await supabase
        .from('achievements')
        .select('rank, id');
        
      if (error) {
        console.error('Error fetching achievements by rank:', error);
        return {};
      }
      
      // Get user unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = userAchievements?.map(a => a.achievement_id) || [];
      
      // Group by rank
      const rankCounts = RankService.RANK_THRESHOLDS.reduce((acc, { rank }) => {
        acc[rank] = { total: 0, unlocked: 0 };
        return acc;
      }, {});
      
      // Count achievements by rank
      achievementsByRank.forEach(achievement => {
        const rank = achievement.rank;
        if (!rankCounts[rank]) {
          rankCounts[rank] = { total: 0, unlocked: 0 };
        }
        
        rankCounts[rank].total++;
        
        if (unlockedIds.includes(achievement.id)) {
          rankCounts[rank].unlocked++;
        }
      });
      
      return rankCounts;
    } catch (error) {
      console.error('Error in getAchievementCountByRank:', error);
      return {};
    }
  }
}

// Re-export types for convenience
export type { Achievement, AchievementStats };
