
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { UserProfileData, UserWorkoutStats } from './AchievementCheckerInterface';
import { TransactionService } from '../../common/TransactionService';
import { AchievementService } from '../AchievementService';

/**
 * Base class for achievement checkers with common utility methods
 */
export abstract class BaseAchievementChecker {
  /**
   * Get workout statistics for a user
   */
  protected static async getWorkoutStats(userId: string): Promise<UserWorkoutStats> {
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
  protected static async getUserProfile(userId: string): Promise<UserProfileData | null> {
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
   * Execute achievement checks with transaction retry support
   */
  protected static async executeChecks(
    userId: string,
    checkFn: () => Promise<string[]>,
    operationName: string
  ): Promise<void> {
    try {
      const achievementIds = await TransactionService.executeWithRetry(
        checkFn,
        operationName,
        3,
        `Failed to check ${operationName}`
      );
      
      if (achievementIds.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementIds);
      }
    } catch (error) {
      console.error(`Error in ${operationName}:`, error);
    }
  }
}
