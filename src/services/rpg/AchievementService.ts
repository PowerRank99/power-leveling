
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { Achievement, AchievementProgress, AchievementStats } from '@/types/achievementTypes';

export class AchievementService {
  /**
   * Checks for and awards achievements based on user progress
   */
  static async checkAchievements(userId: string): Promise<void> {
    try {
      if (!userId) {
        console.error('No userId provided to checkAchievements');
        return;
      }
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('workouts_count, streak, records_count, level, achievement_points')
        .eq('id', userId)
        .single();
        
      if (!profile) {
        console.error('No profile found for user', userId);
        return;
      }
      
      // Get all achievements user doesn't have yet
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get all eligible achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`);
        
      if (!achievements || achievements.length === 0) {
        return;
      }
      
      // Check each achievement
      for (const achievement of achievements) {
        // Parse the requirements JSON to access its properties safely
        const requirements = typeof achievement.requirements === 'string' 
          ? JSON.parse(achievement.requirements) 
          : achievement.requirements;
        
        let achievementUnlocked = false;
        
        // Check workout count achievements
        if (requirements && 
            'workouts_count' in requirements && 
            profile.workouts_count >= requirements.workouts_count) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points
          );
          achievementUnlocked = true;
        }
        
        // Check streak achievements
        if (!achievementUnlocked && 
            requirements && 
            'streak_days' in requirements && 
            profile.streak >= requirements.streak_days) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points
          );
          achievementUnlocked = true;
        }
        
        // Check personal records achievements
        if (!achievementUnlocked && 
            requirements && 
            'records_count' in requirements && 
            profile.records_count >= requirements.records_count) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points
          );
          achievementUnlocked = true;
        }
        
        // Check level-based achievements
        if (!achievementUnlocked && 
            requirements && 
            'level' in requirements && 
            profile.level >= requirements.level) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points
          );
          achievementUnlocked = true;
        }
        
        // Additional achievement types can be added here
      }
    } catch (error) {
      console.error('Error in checkAchievements:', error);
    }
  }
  
  /**
   * Awards an achievement to a user
   */
  private static async awardAchievement(
    userId: string, 
    achievementId: string, 
    achievementName: string,
    achievementDescription: string,
    xpReward: number,
    points: number
  ): Promise<void> {
    try {
      // Record the achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        });
        
      if (error) {
        // If there's a unique constraint violation, the user already has this achievement
        if (error.code !== '23505') { // PostgreSQL unique violation code
          console.error('Error awarding achievement:', error);
        }
        return;
      }
      
      // Update the achievements count, XP, and achievement points
      await supabase.rpc(
        'increment_achievement_and_xp', 
        {
          user_id: userId,
          xp_amount: xpReward,
          points_amount: points
        }
      );
      
      // Show achievement popup - fixed to properly use the Zustand store
      const { showAchievement } = achievementPopupStore.getState();
      showAchievement({
        title: achievementName,
        description: achievementDescription,
        xpReward: xpReward,
        bonusText: "Achievement Unlocked! " + points + " points earned!"
      });
        
      // Also show toast notification
      toast.success(`🏆 Achievement Unlocked!`, {
        description: `${achievementName} (+${xpReward} XP, +${points} points)`
      });
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }

  /**
   * Get all achievements for a specific category
   */
  static async getAchievements(userId: string, category?: string): Promise<Achievement[]> {
    try {
      // Build query
      let query = supabase
        .from('achievements')
        .select('*');
      
      // Filter by category if provided
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Execute query
      const { data, error } = await query.order('rank', { ascending: false });
      
      if (error) {
        throw error;
      }

      // If no user ID, just return all achievements
      if (!userId) {
        return data || [];
      }

      // Get user's achievements to mark which ones are unlocked
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const unlockedAchievementIds = new Set(userAchievements?.map(a => a.achievement_id) || []);

      // Return achievements with unlocked status
      return data.map(achievement => ({
        ...achievement,
        isUnlocked: unlockedAchievementIds.has(achievement.id)
      }));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  /**
   * Get user's unlocked achievements
   */
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          achieved_at,
          achievements (*)
        `)
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(item => ({
        ...item.achievements,
        achievedAt: item.achieved_at
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<AchievementStats> {
    try {
      // Get user profile with level and achievement points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, achievement_points')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }

      // Get total number of achievements
      const { count: totalCount, error: totalError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) {
        throw totalError;
      }

      // Get count of unlocked achievements
      const { count: unlockedCount, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (unlockedError) {
        throw unlockedError;
      }

      // Calculate current rank
      const { data: rankData, error: rankError } = await supabase.rpc(
        'calculate_rank',
        {
          player_level: profile.level,
          achievement_points: profile.achievement_points
        }
      );
      
      const currentRank = rankData || 'Unranked';
      
      // Define the rank progression
      const ranks = ['Unranked', 'E', 'D', 'C', 'B', 'A', 'S'];
      const currentRankIndex = ranks.indexOf(currentRank);
      
      // Calculate next rank and points needed
      let nextRank = null;
      let pointsToNextRank = null;
      
      if (currentRankIndex < ranks.length - 1) {
        nextRank = ranks[currentRankIndex + 1];
        
        // Determine points needed based on rank thresholds
        // This is a simplified calculation and should match the PostgreSQL function logic
        const rankScores = {
          'Unranked': 0,
          'E': 20,
          'D': 50,
          'C': 80,
          'B': 120,
          'A': 160,
          'S': 198
        };
        
        const currentScore = (1.5 * profile.level) + (2 * profile.achievement_points);
        pointsToNextRank = Math.ceil((rankScores[nextRank] - currentScore) / 2);
        if (pointsToNextRank < 0) pointsToNextRank = 0;
      }

      return {
        total: totalCount || 0,
        unlocked: unlockedCount || 0,
        points: profile.achievement_points || 0,
        rank: currentRank,
        nextRank,
        pointsToNextRank
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
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
   * Get progress for a specific achievement
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<AchievementProgress | null> {
    try {
      // Get achievement details
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
      
      if (achievementError) {
        throw achievementError;
      }

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('workouts_count, streak, records_count, level')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }

      // Parse requirements
      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;

      // Check if user has already unlocked this achievement
      const { data: userAchievement, error: userAchievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
      
      const isComplete = !!userAchievement;

      // Calculate progress based on achievement type
      let current = 0;
      let total = 1;

      if ('workouts_count' in requirements) {
        current = profile.workouts_count || 0;
        total = requirements.workouts_count;
      } else if ('streak_days' in requirements) {
        current = profile.streak || 0;
        total = requirements.streak_days;
      } else if ('records_count' in requirements) {
        current = profile.records_count || 0;
        total = requirements.records_count;
      } else if ('level' in requirements) {
        current = profile.level || 1;
        total = requirements.level;
      }

      // Ensure current doesn't exceed total for display purposes
      current = Math.min(current, total);

      return {
        id: achievementId,
        current,
        total,
        isComplete
      };
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return null;
    }
  }
}
