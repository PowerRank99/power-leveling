import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';
import { UserWorkoutStats, UserProfileData } from './AchievementCheckerInterface';

/**
 * Checker for workout-related achievements
 */
export class WorkoutAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all achievements relevant to workout completion
   * Implementation of abstract method from BaseAchievementChecker (static version)
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get workout counts and user stats for achievement checks
        const [workoutStats, userProfile] = await Promise.all([
          this.getWorkoutStats(userId),
          this.getUserProfile(userId)
        ]);

        if (!userProfile) throw new Error('User profile not found');

        // Use executeWithRetry for better reliability in checking achievements
        await TransactionService.executeWithRetry(
          async () => {
            // Update workout count achievement progress using optimized batch function
            if (workoutStats.totalCount > 0) {
              await AchievementProgressService.updateWorkoutCountProgress(userId, workoutStats.totalCount);
            }
            
            // Check other achievement types that don't have progress tracking yet
            await this.executeChecks(
              userId, 
              () => this.checkRankEAchievements(userId, workoutStats, userProfile),
              'rank_e_achievements',
              3
            );
            
            await this.executeChecks(
              userId, 
              () => this.checkRankDAchievements(userId, workoutStats, userProfile),
              'rank_d_achievements',
              3
            );
            
            await this.executeChecks(
              userId, 
              () => this.checkRankCAchievements(userId, workoutStats, userProfile),
              'rank_c_achievements',
              3
            );
            
            await this.executeChecks(
              userId, 
              () => this.checkHigherRankAchievements(userId, workoutStats, userProfile),
              'higher_rank_achievements',
              3
            );
          }, 
          'achievement_checks', 
          3,
          'Failed to check achievements'
        );
      },
      'CHECK_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check workout history achievements
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

  /**
   * Check Rank E achievements (basic starter achievements)
   */
  private static async checkRankEAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<string[]> {
    const achievementChecks: string[] = [];
    
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
    
    return achievementChecks;
  }

  /**
   * Check Rank D achievements (moderate difficulty)
   */
  private static async checkRankDAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    await this.executeChecks(
      userId,
      async () => {
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
        
        return achievementChecks;
      },
      'rank_d_achievements',
      3
    );
  }

  /**
   * Check Rank C achievements (intermediate difficulty)
   */
  private static async checkRankCAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    await this.executeChecks(
      userId,
      async () => {
        const achievementChecks = [];
        
        // 25 total workouts
        if (workoutStats.totalCount >= 25) {
          achievementChecks.push('total-25');
        }
        
        return achievementChecks;
      },
      'rank_c_achievements',
      3
    );
  }

  /**
   * Check higher rank achievements (B, A, S)
   */
  private static async checkHigherRankAchievements(
    userId: string,
    workoutStats: { totalCount: number; weeklyCount: number; monthlyCount: number },
    userProfile: any
  ): Promise<void> {
    await this.executeChecks(
      userId,
      async () => {
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
        
        return achievementChecks;
      },
      'higher_rank_achievements',
      3
    );
  }
}
