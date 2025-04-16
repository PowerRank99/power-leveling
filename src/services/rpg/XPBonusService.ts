
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
        .select('xp, level, class, workouts_count, streak, last_workout_at')
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
      
      // Check if this is a Power Day (user already has a workout today)
      let isPowerDay = false;
      let powerDayAvailable = false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check for Power Day eligibility
      const currentWeek = PowerDayService.getCurrentWeek();
      const currentYear = today.getFullYear();
      
      // Get power day usage for the current week
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', currentWeek)
        .eq('year', currentYear);
      
      // Count the power days used this week
      const powerDayCount = data?.length || 0;
      powerDayAvailable = powerDayCount < 2;
      
      // Apply daily XP cap (default 300 XP per day from regular workout XP)
      // Power Day can increase the cap to 500 XP
      // PR bonuses are always exempt from the cap
      let cappedWorkoutXP = Math.min(totalXP, XP_CONSTANTS.DAILY_XP_CAP);
      
      // If user has Power Day available and would exceed the cap, apply higher cap
      if (powerDayAvailable && totalXP > XP_CONSTANTS.DAILY_XP_CAP) {
        cappedWorkoutXP = Math.min(totalXP, this.POWER_DAY_CAP);
        
        // Record power day usage
        isPowerDay = true;
        await PowerDayService.recordPowerDayUsage(userId, currentWeek, currentYear);
      }
      
      const totalXPWithBonuses = cappedWorkoutXP + recordBonusXP;
      
      // Update profile and check for level up
      await ProfileXPService.updateProfileXP(userId, profile, totalXPWithBonuses);
      
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
    return PowerDayService.getCurrentWeek();
  }

  /**
   * Get power day usage for a user in a specific week - delegated to PowerDayService
   */
  static async getPowerDayUsage(userId: string, week: number, year: number): Promise<{count: number}> {
    return PowerDayService.getPowerDayUsage(userId, week, year);
  }

  /**
   * Check if class passive should preserve streak
   * Enhanced to use the new class architecture
   */
  static async checkStreakPreservation(userId: string, userClass: string | null): Promise<boolean> {
    return PassiveSkillService.checkStreakPreservation(userId, userClass);
  }

  /**
   * Check power day availability - delegated to PowerDayService
   */
  static async checkPowerDayAvailability(userId: string): Promise<{ 
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    return PowerDayService.checkPowerDayAvailability(userId);
  }
  
  /**
   * Record a power day usage - delegated to PowerDayService
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    return PowerDayService.recordPowerDayUsage(userId, week, year);
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
