
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
    
    // Create time brackets for a more readable approach
    const brackets = XP_CONSTANTS.TIME_XP_TIERS;
    
    let remainingMinutes = durationMinutes;
    let previousBracketEnd = 0;
    
    for (const bracket of brackets) {
      // Calculate how many minutes fit in this bracket
      const minutesInBracket = Math.min(
        Math.max(0, remainingMinutes), 
        bracket.minutes - previousBracketEnd
      );
      
      if (minutesInBracket > 0) {
        // Apply proportional XP based on how many minutes in this bracket
        const bracketXP = (minutesInBracket / (bracket.minutes - previousBracketEnd)) * bracket.xp;
        totalXP += bracketXP;
      }
      
      remainingMinutes -= (bracket.minutes - previousBracketEnd);
      previousBracketEnd = bracket.minutes;
      
      if (remainingMinutes <= 0 || bracket.minutes === Infinity) break;
    }
    
    return Math.round(totalXP);
  }
}
