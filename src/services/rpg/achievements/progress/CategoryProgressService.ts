import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AsyncAchievementAdapter } from './AsyncAchievementAdapter';

/**
 * Service for handling achievement progress related to specific categories
 */
export class CategoryProgressService {
  /**
   * Get achievements by category with async support
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    return AsyncAchievementAdapter.filterAchievements(a => a.category === category);
  }
}
