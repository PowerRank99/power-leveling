import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';
import { toast } from 'sonner';
import { AchievementService } from '../AchievementService';
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Centralized service for checking and awarding achievements
 * Organized by rank and category to support the full achievement system
 */
export class AchievementCheckerService {
  /**
   * Check all achievements relevant to workout completion
   */
  static async checkWorkoutRelatedAchievements(
    userId: string,
    workout?: {
      id: string;
      exercises: Array<WorkoutExercise>;
      durationSeconds: number;
    }
  ): Promise<void> {
    try {
      if (!userId) return;

      // Get workout counts and user stats for achievement checks
      const [workoutStats, userProfile] = await Promise.all([
        this.getWorkoutStats(userId),
        this.getUserProfile(userId)
      ]);

      // Check rank E achievements (basic starter achievements)
      await this.checkRankEAchievements(userId, workoutStats, userProfile);
      
      // Check rank D achievements (moderate difficulty)
      await this.checkRankDAchievements(userId, workoutStats, userProfile);
      
      // Check rank C achievements (intermediate difficulty)
      await this.checkRankCAchievements(userId, workoutStats, userProfile);
      
      // Check higher rank achievements (B, A, S)
      await this.checkHigherRankAchievements(userId, workoutStats, userProfile);
      
      // Update achievement points and rank
      await this.updateAchievementPointsAndRank(userId);
    } catch (error) {
      console.error('Error checking workout achievements:', error);
    }
  }

  /**
   * Check all achievements related to personal records
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: {
      exerciseId: string;
      weight: number;
      previousWeight: number;
    }
  ): Promise<void> {
    try {
      if (!userId) return;

      // Get total PR count
      const { count: prCount, error: prError } = await supabase
        .from('personal_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (prError) {
        console.error('Error counting personal records:', prError);
        return;
      }

      // Award first PR achievement
      if (prCount && prCount >= 1) {
        await AchievementService.awardAchievement(userId, 'pr-first');
      }

      // Award PR milestone achievements
      if (prCount && prCount >= 5) {
        await AchievementService.awardAchievement(userId, 'pr-5');
      }
      if (prCount && prCount >= 10) {
        await AchievementService.awardAchievement(userId, 'pr-10');
      }
      if (prCount && prCount >= 25) {
        await AchievementService.awardAchievement(userId, 'pr-25');
      }
      if (prCount && prCount >= 50) {
        await AchievementService.awardAchievement(userId, 'pr-50');
      }

      // Check for impressive PR achievements based on weight increase percentage
      if (recordInfo && recordInfo.previousWeight > 0) {
        const increasePercentage = ((recordInfo.weight - recordInfo.previousWeight) / recordInfo.previousWeight) * 100;
        
        if (increasePercentage >= 10) {
          await AchievementService.awardAchievement(userId, 'pr-increase-10');
        }
        if (increasePercentage >= 20) {
          await AchievementService.awardAchievement(userId, 'pr-increase-20');
        }
      }

      // Update achievement points and rank
      await this.updateAchievementPointsAndRank(userId);
    } catch (error) {
      console.error('Error checking PR achievements:', error);
    }
  }

  /**
   * Check all achievements related to streaks
   */
  static async checkStreakAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;

      // Get user's current streak
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user streak:', profileError);
        return;
      }

      const currentStreak = profile?.streak || 0;

      // Rank E - Basic streak achievement
      if (currentStreak >= 3) {
        await AchievementService.awardAchievement(userId, 'streak-3');
      }

      // Rank D - Moderate streak achievements
      if (currentStreak >= 7) {
        await AchievementService.awardAchievement(userId, 'streak-7');
      }

      // Rank C - Intermediate streak achievements
      if (currentStreak >= 14) {
        await AchievementService.awardAchievement(userId, 'streak-14');
      }

      // Rank B - Advanced streak achievements
      if (currentStreak >= 30) {
        await AchievementService.awardAchievement(userId, 'streak-30');
      }

      // Rank A - Expert streak achievements
      if (currentStreak >= 60) {
        await AchievementService.awardAchievement(userId, 'streak-60');
      }

      // Rank S - Legendary streak achievements
      if (currentStreak >= 100) {
        await AchievementService.awardAchievement(userId, 'streak-100');
      }

      // Update achievement points and rank
      await this.updateAchievementPointsAndRank(userId);
    } catch (error) {
      console.error('Error checking streak achievements:', error);
    }
  }

  /**
   * Check all achievements related to XP milestones
   */
  static async checkXPMilestoneAchievements(userId: string, totalXP: number): Promise<void> {
    try {
      if (!userId) return;

      // Award XP milestone achievements
      if (totalXP >= 1000) {
        await AchievementService.awardAchievement(userId, 'xp-1000');
      }
      if (totalXP >= 5000) {
        await AchievementService.awardAchievement(userId, 'xp-5000');
      }
      if (totalXP >= 10000) {
        await AchievementService.awardAchievement(userId, 'xp-10000');
      }
      if (totalXP >= 50000) {
        await AchievementService.awardAchievement(userId, 'xp-50000');
      }
      if (totalXP >= 100000) {
        await AchievementService.awardAchievement(userId, 'xp-100000');
      }

      // Check level milestone achievements
      if (level >= 10) {
        await AchievementService.awardAchievement(userId, 'level-10');
      }
      if (level >= 25) {
        await AchievementService.awardAchievement(userId, 'level-25');
      }
      if (level >= 50) {
        await AchievementService.awardAchievement(userId, 'level-50');
      }
      if (level >= 75) {
        await AchievementService.awardAchievement(userId, 'level-75');
      }
      if (level >= 99) {
        await AchievementService.awardAchievement(userId, 'level-99');
      }
      
      // Update achievement points and rank
      await this.updateAchievementPointsAndRank(userId);
    } catch (error) {
      console.error('Error checking XP milestone achievements:', error);
    }
  }

  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;

      // Get unique exercise types in the last 7 days
      // We'll use a direct database query instead of RPC for now
      const { data: exerciseTypes, error: typesError } = await supabase
        .from('workout_sets')
        .select('exercise_id')
        .eq('user_id', userId)
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .is('completed', true);
        
      if (typesError) {
        console.error('Error counting distinct exercise types:', typesError);
        return;
      }

      // Count unique exercise IDs
      const uniqueTypes = new Set(exerciseTypes?.map(et => et.exercise_id).filter(Boolean) || []).size;

      // Award activity variety achievements
      if (uniqueTypes >= 3) {
        await AchievementService.awardAchievement(userId, 'variety-3');
      }
      if (uniqueTypes >= 5) {
        await AchievementService.awardAchievement(userId, 'variety-5');
      }
      if (uniqueTypes >= 10) {
        await AchievementService.awardAchievement(userId, 'variety-10');
      }

      // Update achievement points and rank
      await this.updateAchievementPointsAndRank(userId);
    } catch (error) {
      console.error('Error checking activity variety achievements:', error);
    }
  }

  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;

      // Get count of manual workouts
      const { count: manualCount, error: manualError } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (manualError) {
        console.error('Error counting manual workouts:', manualError);
        return;
      }

      // Award manual workout milestone achievements  
      if (manualCount && manualCount >= 1) {
        await AchievementService.awardAchievement(userId, 'manual-first');
      }
      if (manualCount && manualCount >= 5) {
        await AchievementService.awardAchievement(userId, 'manual-5');
      }
      if (manualCount && manualCount >= 10) {
        await AchievementService.awardAchievement(userId, 'manual-10');
      }
      if (manualCount && manualCount >= 25) {
        await AchievementService.awardAchievement(userId, 'manual-25');
      }

      // Check for distinct activity types
      const { data: activityData, error: activityError } = await supabase
        .from('manual_workouts')
        .select('activity_type')
        .eq('user_id', userId);
        
      if (activityError) {
        console.error('Error getting distinct activity types:', activityError);
        return;
      }

      // Count distinct activity types
      const uniqueActivities = new Set((activityData || [])
        .map(workout => workout.activity_type)
        .filter(Boolean)).size;

      // Award activity variety achievements
      if (uniqueActivities >= 3) {
        await AchievementService.awardAchievement(userId, 'activity-variety-3');
      }
      if (uniqueActivities >= 5) {
        await AchievementService.awardAchievement(userId, 'activity-variety-5');
      }

      // Update achievement points and rank
      await this.updateAchievementPointsAndRank(userId);
    } catch (error) {
      console.error('Error checking manual workout achievements:', error);
    }
  }

  /**
   * Check a user's workout history for achievements
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<void> {
    try {
      // Get total workout count 
      const { count: workoutCount, error: workoutError } = await supabase
        .from('workouts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .filter('completed_at', 'not.is.null');
        
      if (workoutError) throw workoutError;
      
      // Get total manual workout count
      const { count: manualWorkoutCount, error: manualError } = await supabase
        .from('manual_workouts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (manualError) throw manualError;
      
      // Combined count
      const totalWorkouts = (workoutCount || 0) + (manualWorkoutCount || 0);
      
      // Check for workout count achievements
      await Promise.all([
        this.checkForAchievement(userId, 'embalo_fitness', { workoutCount: totalWorkouts }),
        this.checkForAchievement(userId, 'dedicacao_semanal', { workoutCount: totalWorkouts })
      ]);
      
      // Get workouts per week
      // Use a simple SQL query instead of RPC to avoid recursion issues
      const { data: weekData, error: weekError } = await supabase
        .from('workouts')
        .select('started_at, count')
        .eq('user_id', userId)
        .filter('completed_at', 'not.is.null')
        .gte('started_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
        
      if (weekError) throw weekError;
      
      // Check for weekly workout achievements
      if (weekData && weekData.length >= 3) {
        await this.checkForAchievement(userId, 'trio_na_semana', {}); 
      }
      
      // Update achievement points and rank
      await this.updateAchievementPointsAndRank(userId);
    } catch (error) {
      console.error('Error checking workout history achievements:', error);
    }
  }

  // Private helper methods

  /**
   * Get workout statistics for a user
   */
  private static async getWorkoutStats(userId: string): Promise<{
    totalCount: number;
    weeklyCount: number;
    monthlyCount: number;
  }> {
    try {
      // Get current date ranges
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get total workout count
      const { count: totalCount, error: totalError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (totalError) throw totalError;
      
      // Get weekly workout count
      const { count: weeklyCount, error: weeklyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString());
        
      if (weeklyError) throw weeklyError;
      
      // Get monthly workout count
      const { count: monthlyCount, error: monthlyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', monthStart.toISOString());
        
      if (monthlyError) throw monthlyError;
      
      return {
        totalCount: totalCount || 0,
        weeklyCount: weeklyCount || 0,
        monthlyCount: monthlyCount || 0
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return { totalCount: 0, weeklyCount: 0, monthlyCount: 0 };
    }
  }

  /**
   * Get user profile data
   */
  private static async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Calculate rank based on level and achievement points
   * Using formula: 1.5 × Level + 2 × (Achievement Points)
   */
  static calculateRankScore(level: number, achievementPoints: number): number {
    return (1.5 * level) + (2 * achievementPoints);
  }

  /**
   * Determine rank based on rank score
   */
  static determineRank(rankScore: number): string {
    if (rankScore >= 198) return 'S';
    if (rankScore >= 160) return 'A';
    if (rankScore >= 120) return 'B';
    if (rankScore >= 80) return 'C';
    if (rankScore >= 50) return 'D';
    if (rankScore >= 20) return 'E';
    return 'Unranked';
  }

  /**
   * Update achievement points and rank in user profile
   */
  private static async updateAchievementPointsAndRank(userId: string): Promise<void> {
    try {
      // Get user's level and achievement points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, achievements_count')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error fetching profile for rank update:', profileError);
        return;
      }
      
      const level = profile.level || 1;
      const achievementPoints = profile.achievements_count || 0;
      
      // Calculate rank score and determine rank
      const rankScore = this.calculateRankScore(level, achievementPoints);
      const rank = this.determineRank(rankScore);
      
      // Update profile with new rank
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ rank })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating profile rank:', updateError);
      }
    } catch (error) {
      console.error('Error updating achievement points and rank:', error);
    }
  }

  /**
   * Check Rank E achievements (basic starter achievements)
   */
  private static async checkRankEAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    try {
      // First workout achievement
      if (workoutStats.totalCount >= 1) {
        await AchievementService.awardAchievement(userId, 'first-workout');
      }
      
      // 3 workouts in a week
      if (workoutStats.weeklyCount >= 3) {
        await AchievementService.awardAchievement(userId, 'weekly-3');
      }
      
      // 7 total workouts
      if (workoutStats.totalCount >= 7) {
        await AchievementService.awardAchievement(userId, 'total-7');
      }
      
      // 3 day streak already checked in checkStreakAchievements
      
      // First guild joined - need to check guilds
      const { count: guildCount, error: guildError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!guildError && guildCount && guildCount > 0) {
        await AchievementService.awardAchievement(userId, 'first-guild');
      }
    } catch (error) {
      console.error('Error checking Rank E achievements:', error);
    }
  }

  /**
   * Check Rank D achievements (moderate difficulty)
   */
  private static async checkRankDAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    try {
      // 10 total workouts
      if (workoutStats.totalCount >= 10) {
        await AchievementService.awardAchievement(userId, 'total-10');
      }
      
      // Early morning workout - need time check
      // This would require checking individual workout start times
      
      // Monthly streak of 10 days
      // Would need a separate monthly tracker
      
      // 3 hour workout total - needs duration tracking
      // This would require summing workout durations
      
      // Guild quest participation - needs guild tracking
      // This would require checking guild_raid_participants
      
      // 7-day streak already checked in checkStreakAchievements
      
      // Join 3 or more guilds - need to check guilds
      const { count: guildCount, error: guildError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!guildError && guildCount && guildCount >= 3) {
        await AchievementService.awardAchievement(userId, 'multiple-guilds');
      }
    } catch (error) {
      console.error('Error checking Rank D achievements:', error);
    }
  }

  /**
   * Check Rank C achievements (intermediate difficulty)
   */
  private static async checkRankCAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    try {
      // 25 total workouts
      if (workoutStats.totalCount >= 25) {
        await AchievementService.awardAchievement(userId, 'total-25');
      }
      
      // 14-day streak already checked in checkStreakAchievements
      
      // Guild quest participation in 3 quests - needs guild tracking
      // This would require counting guild_raid_participants entries
      
      // 10 PRs already checked in checkPersonalRecordAchievements
    } catch (error) {
      console.error('Error checking Rank C achievements:', error);
    }
  }

  /**
   * Check higher rank achievements (B, A, S)
   */
  private static async checkHigherRankAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    try {
      // Rank B achievements
      // 50 total workouts
      if (workoutStats.totalCount >= 50) {
        await AchievementService.awardAchievement(userId, 'total-50');
      }
      
      // 30-day streak already checked in checkStreakAchievements
      
      // Rank A achievements
      // 100 total workouts
      if (workoutStats.totalCount >= 100) {
        await AchievementService.awardAchievement(userId, 'total-100');
      }
      
      // 60-day streak already checked in checkStreakAchievements
      
      // Rank S achievements
      // 200 total workouts
      if (workoutStats.totalCount >= 200) {
        await AchievementService.awardAchievement(userId, 'total-200');
      }
      
      // 365-day streak (legendary)
      if (userProfile?.streak >= 365) {
        await AchievementService.awardAchievement(userId, 'streak-365');
      }
    } catch (error) {
      console.error('Error checking higher rank achievements:', error);
    }
  }

  /**
   * Check for a specific achievement based on criteria
   */
  private static async checkForAchievement(
    userId: string,
    achievementId: string,
    criteria: any = {}
  ): Promise<void> {
    try {
      await AchievementService.awardAchievement(userId, achievementId);
    } catch (error) {
      console.error(`Error checking for achievement ${achievementId}:`, error);
    }
  }
}
