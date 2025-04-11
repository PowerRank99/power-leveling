
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { XP_CONSTANTS } from './constants/xpConstants';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecord } from './PersonalRecordService';
import { PersonalRecordService } from './PersonalRecordService';

interface XPBreakdown {
  base: number;
  classBonus: number;
  streakBonus: number;
  recordBonus: number;
  weeklyBonus: number;
  monthlyBonus: number;
  bonusDetails: { skill: string, amount: number, description: string }[];
}

interface PowerDayUsage {
  count: number;
}

/**
 * Service for handling XP bonuses and updates
 */
export class XPBonusService {
  // Weekly and monthly completion bonus constants
  static readonly WEEKLY_COMPLETION_BONUS = 100;
  static readonly MONTHLY_COMPLETION_BONUS = 300;
  // One week in milliseconds for cooldown checks
  private static readonly ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  // Power Day cap (when user exceeds normal daily cap)
  static readonly POWER_DAY_CAP = 500;

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
      const weeklyMonthlyBonuses = await this.calculateCompletionBonuses(
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
      const currentWeek = this.getCurrentWeek();
      const currentYear = today.getFullYear();
      
      // Get power day usage for the current week
      const { data, error } = await supabase.rpc(
        'get_power_day_usage',
        {
          p_user_id: userId,
          p_week_number: currentWeek,
          p_year: currentYear
        }
      );
      
      // Handle the power day data safely
      let powerDayCount = 0;
      if (!error && data && Array.isArray(data) && data.length > 0) {
        // Since the SQL function returns a table with one column named 'count',
        // we need to access that property on the first element of the array
        powerDayCount = parseInt(data[0]?.count.toString() || '0');
      }
      
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
        await supabase.rpc(
          'create_power_day_usage',
          {
            p_user_id: userId,
            p_week_number: currentWeek,
            p_year: currentYear
          }
        );
      }
      
      const totalXPWithBonuses = cappedWorkoutXP + recordBonusXP;
      
      // Update profile and check for level up
      await this.updateProfileXP(userId, profile, totalXPWithBonuses);
      
      // Show toast with XP breakdown
      this.showXPToast(totalXPWithBonuses, xpBreakdown, isPowerDay);
      
      return true;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }

  /**
   * Get the current ISO week number
   */
  static getCurrentWeek(): number {
    const now = new Date();
    const janFirst = new Date(now.getFullYear(), 0, 1);
    return Math.ceil((((now.getTime() - janFirst.getTime()) / 86400000) + janFirst.getDay() + 1) / 7);
  }

  /**
   * Get power day usage for a user in a specific week
   */
  static async getPowerDayUsage(userId: string, week: number, year: number): Promise<PowerDayUsage> {
    try {
      const { data, error } = await supabase.rpc(
        'get_power_day_usage',
        {
          p_user_id: userId,
          p_week_number: week,
          p_year: year
        }
      );
      
      if (error) {
        console.error('Error checking power day usage:', error);
        return { count: 0 };
      }
      
      // Safely handle the response
      let count = 0;
      if (Array.isArray(data) && data.length > 0) {
        count = parseInt(data[0]?.count.toString() || '0');
      }
      
      return { count };
    } catch (error) {
      console.error('Error checking power day usage:', error);
      return { count: 0 };
    }
  }

  /**
   * Check if Bruxo's Folga Mística passive should preserve streak
   */
  static async checkStreakPreservation(userId: string, userClass: string | null): Promise<boolean> {
    if (!userId || userClass !== 'Bruxo') return false;
    
    try {
      // Use regular query to check for passive skill usage
      const { data, error } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', 'Folga Mística')
        .gte('used_at', new Date(Date.now() - this.ONE_WEEK_MS).toISOString())
        .maybeSingle();
      
      // If there's no data and no error, the player hasn't used it recently
      if (!data && !error) {
        // Record the usage using regular insert
        const { error: insertError } = await supabase
          .from('passive_skill_usage')
          .insert({
            user_id: userId,
            skill_name: 'Folga Mística',
            used_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error recording passive skill usage:', insertError);
          return false;
        }
          
        toast.success('Folga Mística Ativada!', {
          description: 'Seu Bruxo usou magia para preservar sua sequência'
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking streak preservation:', error);
      return false;
    }
  }

  /**
   * Calculate weekly and monthly completion bonuses
   */
  private static async calculateCompletionBonuses(
    userId: string,
    lastWorkoutAt: string | null
  ): Promise<{ weeklyBonus: number; monthlyBonus: number }> {
    try {
      const now = new Date();
      const result = { weeklyBonus: 0, monthlyBonus: 0 };
      
      if (!lastWorkoutAt) return result;
      
      const lastWorkout = new Date(lastWorkoutAt);
      
      // Check for weekly completion (at least 3 workouts in the past 7 days)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      
      const { count: weeklyWorkouts, error: weeklyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString())
        .lt('completed_at', now.toISOString());
        
      if (!weeklyError && weeklyWorkouts !== null && weeklyWorkouts >= 3) {
        result.weeklyBonus = this.WEEKLY_COMPLETION_BONUS;
        console.log(`Applied weekly completion bonus: +${this.WEEKLY_COMPLETION_BONUS} XP`);
      }
      
      // Check for monthly completion (at least 12 workouts in the past 30 days)
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 30);
      
      const { count: monthlyWorkouts, error: monthlyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', monthStart.toISOString())
        .lt('completed_at', now.toISOString());
        
      if (!monthlyError && monthlyWorkouts !== null && monthlyWorkouts >= 12) {
        result.monthlyBonus = this.MONTHLY_COMPLETION_BONUS;
        console.log(`Applied monthly completion bonus: +${this.MONTHLY_COMPLETION_BONUS} XP`);
      }
      
      return result;
    } catch (error) {
      console.error('Error calculating completion bonuses:', error);
      return { weeklyBonus: 0, monthlyBonus: 0 };
    }
  }

  /**
   * Apply class-specific bonuses to XP
   */
  private static async applyClassBonuses(
    userClass: string | null | undefined,
    baseXP: number,
    xpBreakdown: XPBreakdown
  ): Promise<void> {
    try {
      if (!userClass) return;
      
      const { data: bonuses } = await supabase
        .from('class_bonuses')
        .select('bonus_type, bonus_value, description')
        .eq('class_name', userClass)
        .eq('bonus_type', 'workout_completion');
        
      if (bonuses && bonuses.length > 0) {
        // Apply completion bonus (general class bonus)
        const completionBonus = bonuses[0];
        const bonusXP = Math.floor(baseXP * completionBonus.bonus_value);
        xpBreakdown.classBonus = bonusXP;
        console.log(`Applied class bonus (${completionBonus.description}): +${bonusXP} XP`);
      }
    } catch (error) {
      console.error('Error applying class bonuses:', error);
    }
  }

  /**
   * Update user profile with new XP and check for level up
   */
  private static async updateProfileXP(
    userId: string,
    profile: { xp: number; level: number; workouts_count: number },
    totalXP: number
  ): Promise<void> {
    try {
      // Calculate new XP and level
      const currentXP = profile.xp || 0;
      const currentLevel = profile.level || 1;
      const newXP = currentXP + totalXP;
      
      // Check for level up (simple formula: each level needs level*100 XP)
      const xpForNextLevel = currentLevel * 100;
      const shouldLevelUp = currentXP < xpForNextLevel && newXP >= xpForNextLevel;
      const newLevel = shouldLevelUp ? currentLevel + 1 : currentLevel;
      
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          xp: newXP,
          level: newLevel,
          workouts_count: (profile.workouts_count || 0) + 1,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user XP:', error);
        return;
      }
      
      if (shouldLevelUp) {
        toast.success(`🎉 Nível Aumentado!`, {
          description: `Parabéns! Você alcançou o nível ${newLevel}!`
        });
      }
    } catch (error) {
      console.error('Error updating profile XP:', error);
    }
  }

  /**
   * Check power day availability
   */
  static async checkPowerDayAvailability(userId: string): Promise<{ 
    available: boolean;
    count: number;
    max: number;
    week: number;
    year: number;
  }> {
    try {
      const currentWeek = this.getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      const powerDayUsage = await this.getPowerDayUsage(userId, currentWeek, currentYear);
      
      return {
        available: powerDayUsage.count < 2,
        count: powerDayUsage.count,
        max: 2,
        week: currentWeek,
        year: currentYear
      };
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      return {
        available: false,
        count: 0,
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
      const { error } = await supabase.rpc(
        'create_power_day_usage',
        {
          p_user_id: userId,
          p_week_number: week,
          p_year: year
        }
      );
      
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
   * Show toast notification with XP breakdown
   */
  private static showXPToast(totalXP: number, xpBreakdown: XPBreakdown, isPowerDay: boolean = false): void {
    let toastDesc = 'Treino completo!';
    
    const bonuses = [];
    if (xpBreakdown.classBonus > 0) bonuses.push(`Classe: +${xpBreakdown.classBonus}`);
    if (xpBreakdown.streakBonus > 0) bonuses.push(`Streak: +${xpBreakdown.streakBonus}`);
    if (xpBreakdown.recordBonus > 0) bonuses.push(`Recorde: +${xpBreakdown.recordBonus}`);
    if (xpBreakdown.weeklyBonus > 0) bonuses.push(`Semanal: +${xpBreakdown.weeklyBonus}`);
    if (xpBreakdown.monthlyBonus > 0) bonuses.push(`Mensal: +${xpBreakdown.monthlyBonus}`);
    
    if (bonuses.length > 0) {
      toastDesc = `Base: ${xpBreakdown.base} | ${bonuses.join(' | ')}`;
    }
    
    if (isPowerDay) {
      toastDesc += ' | Power Day Ativado!';
    }
    
    toast.success(`+${totalXP} XP`, {
      description: toastDesc
    });
  }
}
