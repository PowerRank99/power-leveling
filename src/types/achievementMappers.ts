
import { AchievementCategory, AchievementRank, toAchievementCategory, toAchievementRank } from './achievementTypes';

/**
 * Maps database category strings to TypeScript enum values with improved safety
 */
export const mapToAchievementCategory = (category: string): AchievementCategory => {
  return toAchievementCategory(category.toLowerCase());
};

/**
 * Maps database rank strings to TypeScript enum values with improved safety
 */
export const mapToAchievementRank = (rank: string): AchievementRank => {
  return toAchievementRank(rank.toUpperCase());
};
