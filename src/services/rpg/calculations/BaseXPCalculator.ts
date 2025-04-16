
import { XP_CONSTANTS } from '../constants/xpConstants';

/**
 * Service for basic XP calculations
 */
export class BaseXPCalculator {
  /**
   * Calculate the streak multiplier (5% per day up to 35% at 7 days)
   */
  static getStreakMultiplier(streak: number): number {
    const maxStreakBonus = XP_CONSTANTS.MAX_STREAK_DAYS;
    const bonusPerDay = XP_CONSTANTS.STREAK_BONUS_PER_DAY;
    const streakDays = Math.min(streak, maxStreakBonus);
    return 1 + (streakDays * bonusPerDay);
  }
  
  /**
   * Calculate time-based XP with diminishing returns
   * First 30 minutes: 40 XP
   * 30-60 minutes: +30 XP
   * 60-90 minutes: +20 XP
   * Beyond 90 minutes: no additional XP
   */
  static calculateTimeXP(durationMinutes: number): number {
    let totalXP = 0;
    let remainingMinutes = durationMinutes;
    
    for (const tier of XP_CONSTANTS.TIME_XP_TIERS) {
      if (remainingMinutes <= 0) break;
      
      const minutesInTier = Math.min(remainingMinutes, tier.minutes);
      const previousTierMinutes = remainingMinutes - minutesInTier;
      const tierMinutes = minutesInTier - previousTierMinutes;
      
      if (tierMinutes > 0) {
        totalXP += tier.xp;
        remainingMinutes -= tierMinutes;
      }
    }
    
    return totalXP;
  }
}
