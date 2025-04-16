
import { supabase } from '@/integrations/supabase/client';
import { XP_CONSTANTS } from './constants/xpConstants';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecord, PersonalRecordService } from './PersonalRecordService';
import { PowerDayService } from './bonus/PowerDayService';
import { CompletionBonusService } from './bonus/CompletionBonusService';
import { PassiveSkillService } from './bonus/PassiveSkillService';
import { ProfileXPService } from './bonus/ProfileXPService';
import { XPToastService, XPBreakdown } from './bonus/XPToastService';

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
          await PersonalRecordService.recordPersonalRecord(
            userId, 
            record.exerciseId, 
            record.weight, 
            record.previousWeight
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
   * Check if Bruxo's Folga Mística passive should preserve streak - delegated to PassiveSkillService
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
}
