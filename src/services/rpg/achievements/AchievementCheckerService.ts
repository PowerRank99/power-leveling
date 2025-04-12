
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '../AchievementService';
import { WorkoutExercise } from '@/types/workoutTypes';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';
import { PersonalRecord } from '../PersonalRecordService';

/**
 * Centralized service for checking and awarding achievements
 * Organized by rank and category to support the full achievement system
 */
export class AchievementCheckerService {
  /**
   * Check all achievements relevant to workout completion
   */
  static async checkWorkoutRelatedAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get workout counts and user stats for achievement checks
        const [workoutStats, userProfile] = await Promise.all([
          this.getWorkoutStats(userId),
          this.getUserProfile(userId)
        ]);

        // Use executeWithRetry for better reliability in checking achievements
        await TransactionService.executeWithRetry(async () => {
          // Update workout count achievement progress using optimized batch function
          if (workoutStats.totalCount > 0) {
            await AchievementProgressService.updateWorkoutCountProgress(userId, workoutStats.totalCount);
          }
          
          // Check other achievement types that don't have progress tracking yet
          await this.checkRankEAchievements(userId, workoutStats, userProfile);
          await this.checkRankDAchievements(userId, workoutStats, userProfile);
          await this.checkRankCAchievements(userId, workoutStats, userProfile);
          await this.checkHigherRankAchievements(userId, workoutStats, userProfile);
        }, 'achievement_checks', 3);
      },
      'CHECK_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Check all achievements related to personal records
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: PersonalRecord
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get total PR count
        const { count: prCount, error: prError } = await supabase
          .from('personal_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (prError) throw prError;

        // Use transaction service to ensure consistency
        await TransactionService.executeWithRetry(async () => {
          // Update PR count achievement progress using optimized batch function
          if (prCount && prCount > 0) {
            await AchievementProgressService.updatePersonalRecordProgress(userId, prCount);
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
        }, 'personal_record_achievements', 3);
      },
      'CHECK_PR_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Check all achievements related to streaks
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get user's current streak
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;

        const currentStreak = profile?.streak || 0;

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(async () => {
          // Update streak achievement progress using optimized batch function
          if (currentStreak > 0) {
            await AchievementProgressService.updateStreakProgress(userId, currentStreak);
          }
        }, 'streak_achievements', 3);
      },
      'CHECK_STREAK_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Check all achievements related to XP milestones
   */
  static async checkXPMilestoneAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get user profile to get current XP if not provided
        let userXP = totalXP;
        let userLevel = 1;
        
        if (!userXP) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level')
            .eq('id', userId)
            .single();
            
          if (profileError) throw profileError;
          
          userXP = profile?.xp || 0;
          userLevel = profile?.level || 1;
        }

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(async () => {
          // Award XP milestone achievements
          const achievementChecks = [];
          
          if (userXP >= 1000) achievementChecks.push('xp-1000');
          if (userXP >= 5000) achievementChecks.push('xp-5000');
          if (userXP >= 10000) achievementChecks.push('xp-10000');
          if (userXP >= 50000) achievementChecks.push('xp-50000');
          if (userXP >= 100000) achievementChecks.push('xp-100000');

          // Level milestone achievements
          if (userLevel >= 10) achievementChecks.push('level-10');
          if (userLevel >= 25) achievementChecks.push('level-25');
          if (userLevel >= 50) achievementChecks.push('level-50');
          if (userLevel >= 75) achievementChecks.push('level-75');
          if (userLevel >= 99) achievementChecks.push('level-99');
          
          // Check all achievements in batch
          if (achievementChecks.length > 0) {
            await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
          }
        }, 'xp_milestone_achievements', 3);
      },
      'CHECK_XP_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Count unique exercise types in the last 7 days
        const { data: exerciseTypes, error: typesError } = await supabase
          .from('workout_sets')
          .select('exercise_id')
          .eq('user_id', userId)
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .is('completed', true);
          
        if (typesError) throw typesError;

        // Count unique exercise IDs
        const uniqueTypes = new Set(exerciseTypes?.map(et => et.exercise_id).filter(Boolean) || []);
        const uniqueCount = uniqueTypes.size;

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(async () => {
          // Award activity variety achievements
          const achievementChecks = [];
          
          if (uniqueCount >= 3) achievementChecks.push('variety-3');
          if (uniqueCount >= 5) achievementChecks.push('variety-5');
          if (uniqueCount >= 10) achievementChecks.push('variety-10');
          
          // Check all achievements in batch
          if (achievementChecks.length > 0) {
            await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
          }
        }, 'activity_variety_achievements', 3);
      },
      'CHECK_VARIETY_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get count of manual workouts
        const { count: manualCount, error: manualError } = await supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (manualError) throw manualError;

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(async () => {
          // Award manual workout milestone achievements  
          const achievementChecks = [];
          
          if (manualCount && manualCount >= 1) achievementChecks.push('manual-first');
          if (manualCount && manualCount >= 5) achievementChecks.push('manual-5');
          if (manualCount && manualCount >= 10) achievementChecks.push('manual-10');
          if (manualCount && manualCount >= 25) achievementChecks.push('manual-25');

          // Check all achievements in batch
          if (achievementChecks.length > 0) {
            await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
          }
          
          // Check for distinct activity types
          const { data: activityData, error: activityError } = await supabase
            .from('manual_workouts')
            .select('activity_type')
            .eq('user_id', userId);
            
          if (activityError) throw activityError;

          // Count distinct activity types
          const uniqueActivities = new Set((activityData || [])
            .map(workout => workout.activity_type)
            .filter(Boolean));
          const uniqueCount = uniqueActivities.size;

          // Award activity variety achievements
          const varietyChecks = [];
          
          if (uniqueCount >= 3) varietyChecks.push('activity-variety-3');
          if (uniqueCount >= 5) varietyChecks.push('activity-variety-5');
          
          // Check all achievements in batch
          if (varietyChecks.length > 0) {
            await AchievementService.checkAndAwardAchievements(userId, varietyChecks);
          }
        }, 'manual_workout_achievements', 3);
      },
      'CHECK_MANUAL_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Check a user's workout history for achievements
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
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
        
        // Use transaction service for consistency
        await TransactionService.executeWithRetry(async () => {
          // Check for workout count achievements
          const achievementChecks = [];
          
          if (totalWorkouts >= 7) achievementChecks.push('embalo_fitness');
          if (totalWorkouts >= 10) achievementChecks.push('dedicacao_semanal');
          
          // Get workouts per week
          const { data: weekData, error: weekError } = await supabase
            .from('workouts')
            .select('started_at')
            .eq('user_id', userId)
            .filter('completed_at', 'not.is.null')
            .gte('started_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
            
          if (weekError) throw weekError;
          
          // Check for weekly workout achievements
          if (weekData && weekData.length >= 3) {
            achievementChecks.push('trio_na_semana');
          }
          
          // Check all achievements in batch
          if (achievementChecks.length > 0) {
            await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
          }
        }, 'workout_history_achievements', 3);
      },
      'CHECK_WORKOUT_HISTORY_ACHIEVEMENTS',
      { showToast: false }
    );
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
   * Calculate rank score based on level and achievement points
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
   * Check Rank E achievements (basic starter achievements)
   */
  private static async checkRankEAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    try {
      const achievementChecks = [];
      
      // First workout achievement
      if (workoutStats.totalCount >= 1) {
        achievementChecks.push('first-workout');
      }
      
      // 3 workouts in a week
      if (workoutStats.weeklyCount >= 3) {
        achievementChecks.push('weekly-3');
      }
      
      // 7 total workouts
      if (workoutStats.totalCount >= 7) {
        achievementChecks.push('total-7');
      }
      
      // First guild joined - need to check guilds
      const { count: guildCount, error: guildError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!guildError && guildCount && guildCount > 0) {
        achievementChecks.push('first-guild');
      }
      
      // Check all achievements in batch
      if (achievementChecks.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
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
      const achievementChecks = [];
      
      // 10 total workouts
      if (workoutStats.totalCount >= 10) {
        achievementChecks.push('total-10');
      }
      
      // Join 3 or more guilds - need to check guilds
      const { count: guildCount, error: guildError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!guildError && guildCount && guildCount >= 3) {
        achievementChecks.push('multiple-guilds');
      }
      
      // Check all achievements in batch
      if (achievementChecks.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
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
      const achievementChecks = [];
      
      // 25 total workouts
      if (workoutStats.totalCount >= 25) {
        achievementChecks.push('total-25');
      }
      
      // Check all achievements in batch
      if (achievementChecks.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
      }
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
      const achievementChecks = [];
      
      // Rank B achievements
      // 50 total workouts
      if (workoutStats.totalCount >= 50) {
        achievementChecks.push('total-50');
      }
      
      // Rank A achievements
      // 100 total workouts
      if (workoutStats.totalCount >= 100) {
        achievementChecks.push('total-100');
      }
      
      // Rank S achievements
      // 200 total workouts
      if (workoutStats.totalCount >= 200) {
        achievementChecks.push('total-200');
      }
      
      // 365-day streak (legendary)
      if (userProfile?.streak >= 365) {
        achievementChecks.push('streak-365');
      }
      
      // Check all achievements in batch
      if (achievementChecks.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
      }
    } catch (error) {
      console.error('Error checking higher rank achievements:', error);
    }
  }
}
