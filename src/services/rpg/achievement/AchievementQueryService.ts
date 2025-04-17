
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementStats } from './types';

export class AchievementQueryService {
  static async getAllAchievements(userId: string): Promise<Achievement[]> {
    try {
      if (!userId) {
        console.error('No userId provided to getAllAchievements');
        return [];
      }
      
      // Fetch all achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: true })
        .order('category', { ascending: true });
        
      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }
      
      // Get user unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = userAchievements?.map(a => a.achievement_id) || [];
      
      // Get achievement progress
      const { data: achievementProgress } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId);
        
      const progressMap = (achievementProgress || []).reduce((map, item) => {
        map[item.achievement_id] = {
          current: item.current_value,
          total: item.target_value,
          percentage: item.target_value > 0 ? (item.current_value / item.target_value) * 100 : 0
        };
        return map;
      }, {});
      
      // Mark which achievements are unlocked
      return achievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id),
        progress: progressMap[achievement.id]
      }));
    } catch (error) {
      console.error('Error in getAllAchievements:', error);
      return [];
    }
  }

  static async getAchievementsByCategory(userId: string, category: string): Promise<Achievement[]> {
    try {
      if (!userId) {
        console.error('No userId provided to getAchievementsByCategory');
        return [];
      }
      
      // Fetch achievements by category
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('rank', { ascending: true });
        
      if (error) {
        console.error('Error fetching achievements by category:', error);
        return [];
      }
      
      // Get user unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = userAchievements?.map(a => a.achievement_id) || [];
      
      // Mark which achievements are unlocked
      return achievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id)
      }));
    } catch (error) {
      console.error('Error in getAchievementsByCategory:', error);
      return [];
    }
  }

  static async getAchievementsByRank(userId: string, rank: string): Promise<Achievement[]> {
    try {
      if (!userId) {
        console.error('No userId provided to getAchievementsByRank');
        return [];
      }
      
      // Fetch achievements by rank
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('rank', rank)
        .order('category', { ascending: true });
        
      if (error) {
        console.error('Error fetching achievements by rank:', error);
        return [];
      }
      
      // Get user unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = userAchievements?.map(a => a.achievement_id) || [];
      
      // Mark which achievements are unlocked
      return achievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id)
      }));
    } catch (error) {
      console.error('Error in getAchievementsByRank:', error);
      return [];
    }
  }

  static async getAchievementStats(userId: string): Promise<AchievementStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_achievement_stats', { p_user_id: userId });
        
      if (error) {
        console.error('Error fetching achievement stats:', error);
        return {
          total: 0,
          unlocked: 0,
          points: 0,
          rank: 'Unranked',
          nextRank: null,
          pointsToNextRank: null,
          rankScore: 0
        };
      }
      
      // Parse data if it's a string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        total: parsedData.total || 0,
        unlocked: parsedData.unlocked || 0,
        points: parsedData.points || 0,
        rank: parsedData.rank || 'Unranked',
        nextRank: parsedData.nextRank,
        pointsToNextRank: parsedData.pointsToNextRank,
        rankScore: parsedData.rankScore || 0
      };
    } catch (error) {
      console.error('Error in getAchievementStats:', error);
      return {
        total: 0,
        unlocked: 0,
        points: 0,
        rank: 'Unranked',
        nextRank: null,
        pointsToNextRank: null,
        rankScore: 0
      };
    }
  }
}
