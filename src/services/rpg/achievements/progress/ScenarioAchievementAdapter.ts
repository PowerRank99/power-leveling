
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AsyncAchievementAdapter } from './AsyncAchievementAdapter';

/**
 * Adapter for handling achievement operations specifically for test scenarios
 */
export class ScenarioAchievementAdapter {
  /**
   * Resolves a Promise<Achievement> or an Achievement into a consistent Achievement
   */
  static async resolveAchievement(achievementPromise: Promise<Achievement> | Achievement): Promise<Achievement> {
    return Promise.resolve(achievementPromise);
  }
  
  /**
   * Helper function to get achievement name safely from a promise
   */
  static async getAchievementName(achievementPromise: Promise<Achievement> | Achievement): Promise<string> {
    const achievement = await this.resolveAchievement(achievementPromise);
    return achievement.name;
  }
  
  /**
   * Helper function to get achievement rank safely from a promise
   */
  static async getAchievementRank(achievementPromise: Promise<Achievement> | Achievement): Promise<string> {
    const achievement = await this.resolveAchievement(achievementPromise);
    return achievement.rank;
  }
  
  /**
   * Map an array of achievement promises to their resolved values
   */
  static async resolveAchievementArray(promises: (Promise<Achievement> | Achievement)[] | Promise<Achievement[]> | Achievement[]): Promise<Achievement[]> {
    // Handle the case where the input is a Promise<Achievement[]>
    if (promises instanceof Promise) {
      const resolvedArray = await promises;
      return Promise.all(resolvedArray.map(a => this.resolveAchievement(a)));
    }
    
    // Handle the case where the input is an array of Promise<Achievement> or Achievement
    return Promise.all((promises as any[]).map(p => this.resolveAchievement(p)));
  }
  
  /**
   * Filter an array of achievement promises based on a predicate
   */
  static async filterAchievementPromises(
    promises: (Promise<Achievement> | Achievement)[] | Promise<Achievement[]> | Achievement[],
    predicate: (achievement: Achievement) => boolean
  ): Promise<Achievement[]> {
    const resolved = await this.resolveAchievementArray(promises);
    return resolved.filter(predicate);
  }
  
  /**
   * Map an array of achievement promises using a transform function
   */
  static async mapAchievementPromises<T>(
    promises: (Promise<Achievement> | Achievement)[] | Promise<Achievement[]> | Achievement[],
    transform: (achievement: Achievement) => T
  ): Promise<T[]> {
    const resolved = await this.resolveAchievementArray(promises);
    return resolved.map(transform);
  }
  
  /**
   * Sort an array of achievement promises using a comparator
   */
  static async sortAchievementPromises(
    promises: (Promise<Achievement> | Achievement)[] | Promise<Achievement[]> | Achievement[],
    comparator: (a: Achievement, b: Achievement) => number
  ): Promise<Achievement[]> {
    const resolved = await this.resolveAchievementArray(promises);
    return [...resolved].sort(comparator);
  }
  
  /**
   * Helper for backward compatibility with scenario code
   */
  static addActionMethod(instance: any) {
    if (!instance.addAction) {
      instance.addAction = function(action: string, details: string) {
        console.log(`${action}: ${details}`);
        return this;
      };
    }
  }
}
