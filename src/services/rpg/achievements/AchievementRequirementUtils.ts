
import { Achievement } from '@/types/achievementTypes';

/**
 * Utility functions for working with achievement requirements
 */
export class AchievementRequirementUtils {
  /**
   * Extract a numeric requirement value from an achievement
   */
  static getNumericRequirement(achievement: Achievement, key: string): number {
    if (!achievement.requirements) return 0;
    
    const value = achievement.requirements[key];
    if (typeof value === 'number') return value;
    
    // Try to parse as number if it's a string
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) return parsed;
    }
    
    return 0;
  }
  
  /**
   * Get the count requirement (most common type)
   */
  static getCountRequirement(achievement: Achievement): number {
    return this.getNumericRequirement(achievement, 'count');
  }
  
  /**
   * Get the streak days requirement
   */
  static getStreakRequirement(achievement: Achievement): number {
    return this.getNumericRequirement(achievement, 'days');
  }
  
  /**
   * Get the XP requirement
   */
  static getXpRequirement(achievement: Achievement): number {
    return this.getNumericRequirement(achievement, 'xp');
  }
  
  /**
   * Get the level requirement
   */
  static getLevelRequirement(achievement: Achievement): number {
    return this.getNumericRequirement(achievement, 'level');
  }
  
  /**
   * Check if a numeric value satisfies an achievement's requirement
   */
  static meetsNumericRequirement(achievement: Achievement, value: number, key: string): boolean {
    const requirement = this.getNumericRequirement(achievement, key);
    return value >= requirement;
  }
}
