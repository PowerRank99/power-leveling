import { supabase } from '@/integrations/supabase/client';
import { XP_CONSTANTS } from './constants/xpConstants';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecordService, PersonalRecord } from './PersonalRecordService';
import { PowerDayService } from './bonus/PowerDayService';
import { CompletionBonusService } from './bonus/CompletionBonusService';
import { PassiveSkillService } from './bonus/PassiveSkillService';
import { ProfileXPService } from './bonus/ProfileXPService';
import { XPToastService, XPBreakdown } from './bonus/XPToastService';
import { ClassBonusCalculator } from './calculations/ClassBonusCalculator';
import { getClassRegistry } from './registry/ClassRegistry';
import { PassiveSkillContext } from './types/PassiveSkillTypes';
import { ManualWorkoutValidationService } from '@/services/workout/manual/ManualWorkoutValidationService';

/**
 * Main service for handling XP bonuses and updates
 * Coordinates the various specialized bonus services
 */
export class XPBonusService {
  // Weekly and monthly completion bonus constants
  static readonly WEEKLY_COMPLETION_BONUS = CompletionBonusService.WEEKLY_COMPLETION_BONUS;
  static readonly MONTHLY_COMPLETION_BONUS = CompletionBonusService.MONTHLY_COMPLETION_BONUS;
  // Power Day cap (when user exceeds normal daily cap)
  static readonly POWER_DAY_CAP = PowerDayService.POWER_DAY_CAP;

  /**
   * Awards XP to a user and updates their level if necessary
   */
  static async awardXP(
    userId: string, 
    baseXP: number, 
    personalRecords: PersonalRecord[] = [],
    bonusDetails: { skill: string, amount: number, description: string }[] = []
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error('No userId provided to awardXP');
        return false;
      }

      console.log(`Awarding base ${baseXP} XP to user ${userId}`);
      
      // Get user profile and class bonuses (if any)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, level, class, workouts_count, streak, last_workout_at, daily_xp')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return false;
      }
      
      let totalXP = baseXP;
      let xpBreakdown: XPBreakdown = {
        base: baseXP,
        classBonus: 0,
        streakBonus: 0,
        recordBonus: 0,
        weeklyBonus: 0,
        monthlyBonus: 0,
        bonusDetails: bonusDetails
      };
      
      // Apply streak bonus
      if (profile.streak && profile.streak > 1) {
        const streakMultiplier = XPCalculationService.getStreakMultiplier(profile.streak);
        const streakBonus = Math.floor(baseXP * (streakMultiplier - 1));
        xpBreakdown.streakBonus = streakBonus;
        totalXP += streakBonus;
        console.log(`Applied streak bonus (${profile.streak} days): +${streakBonus} XP`);
      }
      
      // Check for weekly and monthly completion bonuses
      const weeklyMonthlyBonuses = await CompletionBonusService.calculateCompletionBonuses(
        userId, 
        profile.last_workout_at
      );
      
      xpBreakdown.weeklyBonus = weeklyMonthlyBonuses.weeklyBonus;
      xpBreakdown.monthlyBonus = weeklyMonthlyBonuses.monthlyBonus;
      totalXP += weeklyMonthlyBonuses.weeklyBonus + weeklyMonthlyBonuses.monthlyBonus;
      
      // Apply personal record bonuses (not subject to daily cap)
      let recordBonusXP = 0;
      if (personalRecords.length > 0) {
        // Limit to one PR bonus per workout to prevent farming
        recordBonusXP = XPCalculationService.PR_BONUS_XP;
        console.log(`Applied personal record bonus: +${recordBonusXP} XP`);
        
        // Record which exercises had PRs (for weekly cooldown)
        for (const record of personalRecords) {
          // Use supabase RPC to record the personal record
          await supabase.rpc(
            'insert_personal_record',
            {
              p_user_id: userId,
              p_exercise_id: record.exerciseId,
              p_weight: record.weight,
              p_previous_weight: record.previousWeight
            }
          );
        }
      }
      xpBreakdown.recordBonus = recordBonusXP;
      
      // Calculate new daily XP total
      const currentDailyXP = profile.daily_xp || 0;
      const newDailyXP = currentDailyXP + totalXP;
      console.log(`Current daily XP: ${currentDailyXP}, New daily XP after this workout: ${newDailyXP}`);
      
      // Check if this should be a Power Day (2+ workouts and exceeds 300 XP)
      let isPowerDay = false;
      
      // Only check for Power Day if daily XP would exceed cap
      if (newDailyXP > XP_CONSTANTS.DAILY_XP_CAP) {
        // Check if user is eligible for a Power Day
        const { available } = await ManualWorkoutValidationService.checkPowerDayAvailability(userId);
        
        if (available) {
          isPowerDay = true;
          // Record the Power Day usage
          await ManualWorkoutValidationService.recordPowerDayUsage(userId);
          console.log('Power Day activated! XP cap increased to 500');
        } else {
          console.log('User exceeded daily XP but has no Power Days available this week');
        }
      }
      
      // Apply daily XP cap (default 300 XP per day from regular workout XP)
      // Power Day can increase the cap to 500 XP
      // PR bonuses are always exempt from the cap
      let cappedWorkoutXP = totalXP;
      let xpCap = XP_CONSTANTS.DAILY_XP_CAP;
      
      // If user has Power Day and would exceed the cap, apply higher cap
      if (isPowerDay) {
        xpCap = this.POWER_DAY_CAP;
      }
      
      // Make sure we don't exceed the daily cap
      if (newDailyXP > xpCap) {
        const allowedXP = Math.max(0, xpCap - currentDailyXP);
        console.log(`Capping workout XP to ${allowedXP} (daily cap: ${xpCap}, current daily: ${currentDailyXP})`);
        cappedWorkoutXP = allowedXP;
      }
      
      const totalXPWithBonuses = cappedWorkoutXP + recordBonusXP;
      
      // Update profile with XP, last workout time, and daily XP
      await supabase
        .from('profiles')
        .update({
          xp: profile.xp + totalXPWithBonuses,
          workouts_count: (profile.workouts_count || 0) + 1,
          last_workout_at: new Date().toISOString(),
          daily_xp: Math.min(newDailyXP, xpCap) // Update daily XP tracking
        })
        .eq('id', userId);
      
      // Check for level up
      await ProfileXPService.checkLevelUp(userId, profile.xp, profile.xp + totalXPWithBonuses);
      
      // Show toast with XP breakdown
      XPToastService.showXPToast(totalXPWithBonuses, xpBreakdown, isPowerDay);
      
      return true;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }

  /**
   * Get the current ISO week number - delegated to PowerDayService
   */
  static getCurrentWeek(): number {
    return ManualWorkoutValidationService.getCurrentWeek();
  }

  /**
   * Get power day usage for a user in a specific week
   */
  static async getPowerDayUsage(userId: string, week: number, year: number): Promise<{count: number}> {
    try {
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', week)
        .eq('year', year);
      
      if (error) {
        console.error('Error checking power day usage:', error);
        return { count: 0 };
      }
      
      return { count: data?.length || 0 };
    } catch (error) {
      console.error('Error checking power day usage:', error);
      return { count: 0 };
    }
  }

  /**
   * Check if class passive should preserve streak
   * Enhanced to use the new class architecture
   */
  static async checkStreakPreservation(userId: string, userClass: string | null): Promise<boolean> {
    return PassiveSkillService.checkStreakPreservation(userId, userClass);
  }

  /**
   * Check power day availability
   */
  static async checkPowerDayAvailability(userId: string): Promise<{ 
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    try {
      const currentWeek = this.getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', currentWeek)
        .eq('year', currentYear);
      
      const usedCount = data?.length || 0;
      
      return {
        available: usedCount < 2,
        used: usedCount,
        max: 2,
        week: currentWeek,
        year: currentYear
      };
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      return {
        available: false,
        used: 0,
        max: 2,
        week: 0,
        year: 0
      };
    }
  }
  
  /**
   * Record a power day usage
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('power_day_usage')
        .insert({
          user_id: userId,
          week_number: week,
          year: year
        });
      
      if (error) {
        console.error('Error recording power day usage:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording power day usage:', error);
      return false;
    }
  }
  
  /**
   * Calculate class bonuses using the new class registry
   * This method provides a transition path from the old class system to the new one
   */
  static calculateClassBonuses(
    userId: string,
    userClass: string | null,
    workout: {
      id: string;
      exercises: any[];
      durationSeconds: number;
      hasPR?: boolean;
    }
  ): {
    totalBonus: number;
    bonusDetails: { skill: string, amount: number, description: string }[];
  } {
    // Default to empty result
    const defaultResult = {
      totalBonus: 0,
      bonusDetails: []
    };
    
    try {
      // If no class, return no bonuses
      if (!userClass) return defaultResult;
      
      // Get class registry
      const registry = getClassRegistry();
      if (!registry) return defaultResult;
      
      // Prepare context for skill calculation
      const exerciseTypes: Record<string, number> = {};
      
      // Count exercises by type
      for (const exercise of workout.exercises) {
        if (exercise.type) {
          exerciseTypes[exercise.type] = (exerciseTypes[exercise.type] || 0) + 1;
        }
      }
      
      // Count total completed sets
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + (ex.sets?.filter(set => set.completed)?.length || 0);
      }, 0);
      
      // Create passive skill context
      const context: PassiveSkillContext = {
        userId,
        userClass,
        streak: 0, // Will be filled in later if needed
        durationMinutes: Math.floor(workout.durationSeconds / 60),
        exerciseTypes,
        totalExercises: workout.exercises.length,
        exerciseCount: workout.exercises.length, // Added the missing exerciseCount property
        setCount: completedSets, // Added the missing setCount property
        hasPR: workout.hasPR || false,
        baseXP: 0, // Will be filled in later
        streakMultiplier: 0 // Will be filled in later
      };
      
      // Calculate bonuses using registry
      const bonusResult = registry.calculatePassiveSkillBonuses(context);
      
      // Convert to expected format
      return {
        totalBonus: bonusResult.totalBonus,
        bonusDetails: bonusResult.results.map(result => ({
          skill: result.skillName,
          amount: result.bonusXP,
          description: result.description
        }))
      };
    } catch (error) {
      console.error('Error calculating class bonuses:', error);
      return defaultResult;
    }
  }
}
