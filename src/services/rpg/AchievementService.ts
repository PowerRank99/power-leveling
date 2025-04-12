
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementStats } from '@/types/achievementTypes';
import { XPService } from './XPService';

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

      // Get achievement progress
      const { data: progress, error: progressError } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      // Map and merge the data
      const achievementsWithStatus = achievements.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
        const achievementProgress = progress?.find(p => p.achievement_id === achievement.id);

        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          rank: achievement.rank,
          points: achievement.points,
          xpReward: achievement.xp_reward,
          iconName: achievement.icon_name,
          requirements: achievement.requirements,
          isUnlocked: !!userAchievement,
          achievedAt: userAchievement?.achieved_at,
          progress: achievementProgress ? {
            id: achievementProgress.id,
            current: achievementProgress.current_value,
            total: achievementProgress.target_value,
            isComplete: achievementProgress.is_complete
          } : undefined
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
      const achievements: Achievement[] = data.map(item => ({
        id: item.achievements.id,
        name: item.achievements.name,
        description: item.achievements.description,
        category: item.achievements.category,
        rank: item.achievements.rank,
        points: item.achievements.points,
        xpReward: item.achievements.xp_reward,
        iconName: item.achievements.icon_name,
        requirements: item.achievements.requirements,
        isUnlocked: true,
        achievedAt: item.achieved_at
      }));

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

      // Get user profile for points
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('achievement_points')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Calculate rank based on points
      const points = profileData?.achievement_points || 0;
      const rank = this.calculateRank(points);
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
   * Award an achievement to a user
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      // Check if the user already has this achievement
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

      // Add achievement to user_achievements
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          achieved_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Award XP to user
      await XPService.awardXP(userId, achievement.xp_reward, 'achievement', {
        achievementId,
        achievementName: achievement.name
      });

      // Update achievement points in profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          achievement_points: supabase.rpc('increment', { 
            row_id: userId, 
            table_name: 'profiles', 
            column_name: 'achievement_points', 
            increment_amount: achievement.points 
          }),
          achievements_count: supabase.rpc('increment', {
            row_id: userId,
            table_name: 'profiles',
            column_name: 'achievements_count',
            increment_amount: 1
          })
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }

  /**
   * Check workout achievements
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<void> {
    try {
      // Check for first workout achievement
      await this.checkFirstWorkoutAchievement(userId);

      // Check workout count achievements
      await this.checkWorkoutCountAchievements(userId);

      // Check workout streak achievements
      await this.checkStreakAchievements(userId);

      // Check workout duration achievements
      await this.checkWorkoutDurationAchievements(userId, workoutId);

      // Check workout variety achievements
      await this.checkWorkoutVarietyAchievements(userId);
    } catch (error) {
      console.error('Error checking workout achievements:', error);
    }
  }

  /**
   * Check streak achievements
   */
  static async checkStreakAchievements(userId: string): Promise<void> {
    try {
      // Get user's current streak
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const currentStreak = profile?.streak || 0;

      // Check for streak achievements
      if (currentStreak >= 7) {
        await this.awardAchievement(userId, 'streak-7');
      }

      if (currentStreak >= 14) {
        await this.awardAchievement(userId, 'streak-14');
      }

      if (currentStreak >= 30) {
        await this.awardAchievement(userId, 'streak-30');
      }

      if (currentStreak >= 60) {
        await this.awardAchievement(userId, 'streak-60');
      }

      if (currentStreak >= 100) {
        await this.awardAchievement(userId, 'streak-100');
      }
    } catch (error) {
      console.error('Error checking streak achievements:', error);
    }
  }

  /**
   * Check guild achievements
   */
  static async checkGuildAchievements(userId: string, guildId: string): Promise<void> {
    try {
      // Check if user is in a guild
      await this.checkGuildMembershipAchievement(userId);

      // Check if user has participated in raids
      await this.checkGuildRaidParticipationAchievements(userId);

      // Check if user has completed raids
      await this.checkGuildRaidCompletionAchievements(userId);
    } catch (error) {
      console.error('Error checking guild achievements:', error);
    }
  }

  /**
   * Check record achievements
   */
  static async checkRecordAchievements(userId: string, exerciseId: string): Promise<void> {
    try {
      // Check for first PR achievement
      await this.checkFirstPRAchievement(userId);

      // Check for PR count achievements
      await this.checkPRCountAchievements(userId);
    } catch (error) {
      console.error('Error checking record achievements:', error);
    }
  }

  /**
   * Check manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string, workoutId: string): Promise<void> {
    try {
      // Check for first manual workout achievement
      await this.checkFirstManualWorkoutAchievement(userId);

      // Check for manual workout count achievements
      await this.checkManualWorkoutCountAchievements(userId);

      // Check for activity type achievements
      await this.checkActivityTypeAchievements(userId);
    } catch (error) {
      console.error('Error checking manual workout achievements:', error);
    }
  }

  /**
   * Check first workout achievement
   */
  private static async checkFirstWorkoutAchievement(userId: string): Promise<void> {
    try {
      // Get workout count
      const { count, error } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Award achievement for first workout
      if (count === 1) {
        await this.awardAchievement(userId, 'first-workout');
      }
    } catch (error) {
      console.error('Error checking first workout achievement:', error);
    }
  }

  /**
   * Check workout count achievements
   */
  private static async checkWorkoutCountAchievements(userId: string): Promise<void> {
    try {
      // Get workout count
      const { count, error } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Check for workout count achievements
      if (count >= 5) {
        await this.awardAchievement(userId, 'workout-5');
      }

      if (count >= 10) {
        await this.awardAchievement(userId, 'workout-10');
      }

      if (count >= 25) {
        await this.awardAchievement(userId, 'workout-25');
      }

      if (count >= 50) {
        await this.awardAchievement(userId, 'workout-50');
      }

      if (count >= 100) {
        await this.awardAchievement(userId, 'workout-100');
      }
    } catch (error) {
      console.error('Error checking workout count achievements:', error);
    }
  }

  /**
   * Check workout duration achievements
   */
  private static async checkWorkoutDurationAchievements(userId: string, workoutId: string): Promise<void> {
    try {
      // Get workout duration
      const { data: workout, error } = await supabase
        .from('workouts')
        .select('duration_seconds')
        .eq('id', workoutId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const durationMinutes = (workout?.duration_seconds || 0) / 60;

      // Check for duration achievements
      if (durationMinutes >= 60) {
        await this.awardAchievement(userId, 'workout-60min');
      }

      if (durationMinutes >= 90) {
        await this.awardAchievement(userId, 'workout-90min');
      }

      if (durationMinutes >= 120) {
        await this.awardAchievement(userId, 'workout-120min');
      }
    } catch (error) {
      console.error('Error checking workout duration achievements:', error);
    }
  }

  /**
   * Check workout variety achievements
   */
  private static async checkWorkoutVarietyAchievements(userId: string): Promise<void> {
    try {
      // Get count of distinct exercise types in the last 7 days
      const { data, error } = await supabase.rpc('count_distinct_exercise_types', {
        user_id: userId,
        days_back: 7
      });

      if (error) throw error;

      const distinctExerciseCount = data?.length || 0;

      // Check for variety achievements
      if (distinctExerciseCount >= 5) {
        await this.awardAchievement(userId, 'variety-5');
      }

      if (distinctExerciseCount >= 10) {
        await this.awardAchievement(userId, 'variety-10');
      }

      if (distinctExerciseCount >= 15) {
        await this.awardAchievement(userId, 'variety-15');
      }
    } catch (error) {
      console.error('Error checking workout variety achievements:', error);
    }
  }

  /**
   * Check guild membership achievement
   */
  private static async checkGuildMembershipAchievement(userId: string): Promise<void> {
    try {
      // Check if user is in a guild
      const { count, error } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      if (count && count > 0) {
        await this.awardAchievement(userId, 'join-guild');
      }
    } catch (error) {
      console.error('Error checking guild membership achievement:', error);
    }
  }

  /**
   * Check guild raid participation achievements
   */
  private static async checkGuildRaidParticipationAchievements(userId: string): Promise<void> {
    try {
      // Get count of raids participated in
      const { count, error } = await supabase
        .from('guild_raid_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Check for raid participation achievements
      if (count && count >= 1) {
        await this.awardAchievement(userId, 'raid-participation-1');
      }

      if (count && count >= 5) {
        await this.awardAchievement(userId, 'raid-participation-5');
      }

      if (count && count >= 10) {
        await this.awardAchievement(userId, 'raid-participation-10');
      }
    } catch (error) {
      console.error('Error checking guild raid participation achievements:', error);
    }
  }

  /**
   * Check guild raid completion achievements
   */
  private static async checkGuildRaidCompletionAchievements(userId: string): Promise<void> {
    try {
      // Get count of completed raids
      const { count, error } = await supabase
        .from('guild_raid_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;

      // Check for raid completion achievements
      if (count && count >= 1) {
        await this.awardAchievement(userId, 'raid-completion-1');
      }

      if (count && count >= 5) {
        await this.awardAchievement(userId, 'raid-completion-5');
      }

      if (count && count >= 10) {
        await this.awardAchievement(userId, 'raid-completion-10');
      }
    } catch (error) {
      console.error('Error checking guild raid completion achievements:', error);
    }
  }

  /**
   * Check first PR achievement
   */
  private static async checkFirstPRAchievement(userId: string): Promise<void> {
    try {
      // Get PR count
      const { count, error } = await supabase
        .from('personal_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Award achievement for first PR
      if (count === 1) {
        await this.awardAchievement(userId, 'first-pr');
      }
    } catch (error) {
      console.error('Error checking first PR achievement:', error);
    }
  }

  /**
   * Check PR count achievements
   */
  private static async checkPRCountAchievements(userId: string): Promise<void> {
    try {
      // Get PR count
      const { count, error } = await supabase
        .from('personal_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Check for PR count achievements
      if (count && count >= 5) {
        await this.awardAchievement(userId, 'pr-5');
      }

      if (count && count >= 10) {
        await this.awardAchievement(userId, 'pr-10');
      }

      if (count && count >= 25) {
        await this.awardAchievement(userId, 'pr-25');
      }

      if (count && count >= 50) {
        await this.awardAchievement(userId, 'pr-50');
      }
    } catch (error) {
      console.error('Error checking PR count achievements:', error);
    }
  }

  /**
   * Check first manual workout achievement
   */
  private static async checkFirstManualWorkoutAchievement(userId: string): Promise<void> {
    try {
      // Get manual workout count
      const { count, error } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Award achievement for first manual workout
      if (count === 1) {
        await this.awardAchievement(userId, 'first-manual-workout');
      }
    } catch (error) {
      console.error('Error checking first manual workout achievement:', error);
    }
  }

  /**
   * Check manual workout count achievements
   */
  private static async checkManualWorkoutCountAchievements(userId: string): Promise<void> {
    try {
      // Get manual workout count
      const { count, error } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Check for manual workout count achievements
      if (count && count >= 5) {
        await this.awardAchievement(userId, 'manual-workout-5');
      }

      if (count && count >= 10) {
        await this.awardAchievement(userId, 'manual-workout-10');
      }

      if (count && count >= 25) {
        await this.awardAchievement(userId, 'manual-workout-25');
      }
    } catch (error) {
      console.error('Error checking manual workout count achievements:', error);
    }
  }

  /**
   * Check activity type achievements
   */
  private static async checkActivityTypeAchievements(userId: string): Promise<void> {
    try {
      // Get distinct activity types
      const { data, error } = await supabase.rpc('get_distinct_activity_types', {
        user_id: userId
      });

      if (error) throw error;

      const distinctActivityCount = data ? data.length : 0;

      // Check for activity type variety achievements
      if (distinctActivityCount >= 3) {
        await this.awardAchievement(userId, 'activity-variety-3');
      }

      if (distinctActivityCount >= 5) {
        await this.awardAchievement(userId, 'activity-variety-5');
      }

      if (distinctActivityCount >= 10) {
        await this.awardAchievement(userId, 'activity-variety-10');
      }
    } catch (error) {
      console.error('Error checking activity type achievements:', error);
    }
  }

  /**
   * Calculate rank based on points
   */
  private static calculateRank(points: number): string {
    if (points >= 1000) return 'S';
    if (points >= 500) return 'A';
    if (points >= 250) return 'B';
    if (points >= 100) return 'C';
    if (points >= 50) return 'D';
    if (points >= 10) return 'E';
    return 'Unranked';
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
}
