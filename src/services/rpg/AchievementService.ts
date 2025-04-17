import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { RankService } from './RankService';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rank: string;
  points: number;
  xp_reward: number;
  icon_name: string;
  requirements: any;
  string_id: string;
  unlocked?: boolean;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  points: number;
  rank: string;
  nextRank: string | null;
  pointsToNextRank: number | null;
  rankScore: number;
}

export class AchievementService {
  static async checkAchievements(userId: string): Promise<void> {
    try {
      if (!userId) {
        console.error('No userId provided to checkAchievements');
        return;
      }
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('workouts_count, streak, records_count')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      console.log('Checking achievements with profile data:', {
        workouts_count: profile.workouts_count,
        streak: profile.streak,
        records_count: profile.records_count
      });
      
      // First, let's explicitly check the "Primeiro Treino" achievement
      const { data: primeiroTreino, error: primeiroTreinoError } = await supabase
        .from('achievements')
        .select('*')
        .eq('string_id', 'primeiro-treino')
        .maybeSingle();
      
      if (primeiroTreinoError) {
        console.error('Error fetching Primeiro Treino achievement:', primeiroTreinoError);
      } else if (primeiroTreino) {
        console.log('Found Primeiro Treino achievement:', primeiroTreino);
        
        // Check if user already has this achievement
        const { data: hasAchievement, error: hasAchievementError } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', userId)
          .eq('achievement_id', primeiroTreino.id)
          .maybeSingle();
          
        console.log('Has Primeiro Treino achievement?', hasAchievement);
        console.log('Check result:', {
          hasAchievement,
          workoutsCount: profile.workouts_count,
          meetsCondition: profile.workouts_count > 0 && !hasAchievement
        });
        
        // If user doesn't have the achievement and has at least one workout
        if (!hasAchievement && profile.workouts_count > 0) {
          console.log('Awarding Primeiro Treino achievement');
          await this.awardAchievement(
            userId,
            primeiroTreino.id,
            primeiroTreino.name,
            primeiroTreino.description,
            primeiroTreino.xp_reward,
            primeiroTreino.points
          );
          // Return early as we've awarded the achievement
          return;
        }
      }

      // Get all achievements user doesn't have yet
      const { data: unlockedAchievements, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      if (unlockedError) {
        console.error('Error fetching unlocked achievements:', unlockedError);
        return;
      }

      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      console.log('Already unlocked achievement IDs:', unlockedIds);
      
      // Get all eligible achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'NULL'})`);

      if (achievementsError || !achievements) {
        console.error('Error fetching achievements:', achievementsError);
        return;
      }

      console.log('Checking eligible achievements:', achievements.length);
      
      // Check each achievement
      for (const achievement of achievements) {
        try {
          // Parse the requirements JSON
          const requirements = typeof achievement.requirements === 'string' 
            ? JSON.parse(achievement.requirements) 
            : achievement.requirements;
          
          let achievementUnlocked = false;
          
          // Check workout count achievements
          if (requirements && 
              'workouts_count' in requirements && 
              profile.workouts_count >= requirements.workouts_count) {
            console.log('Unlocking workout achievement:', {
              name: achievement.name,
              required: requirements.workouts_count,
              current: profile.workouts_count
            });
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
            console.log('Unlocking streak achievement:', {
              name: achievement.name,
              required: requirements.streak_days,
              current: profile.streak
            });
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
            console.log('Unlocking records achievement:', {
              name: achievement.name,
              required: requirements.records_count,
              current: profile.records_count
            });
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
          
          if (achievementUnlocked) {
            console.log('Achievement unlocked:', achievement.name);
          }
        } catch (error) {
          console.error('Error checking achievement:', achievement.id, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error in checkAchievements:', error);
    }
  }
  
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
      
      // Update the achievements count and XP
      // Using a transaction to ensure both updates succeed or fail together
      // Use type assertion to make TypeScript happy with our custom RPC function
      await supabase.rpc(
        'increment_achievement_and_xp' as any, 
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
        bonusText: "Excede o limite diário"
      });
        
      // Also show toast notification
      toast.success(`🏆 Conquista Desbloqueada!`, {
        description: `${achievementName} (+${xpReward} XP, +${points} pontos)`
      });
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }
  
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
  
  static async getAchievementCountByRank(userId: string): Promise<Record<string, { total: number, unlocked: number }>> {
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
