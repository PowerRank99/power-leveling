
import { AchievementCategory, AchievementRank } from './achievementTypes';

/**
 * Maps database category strings to TypeScript enum values
 */
export const mapToAchievementCategory = (category: string): AchievementCategory => {
  const normalizedCategory = category.toLowerCase();
  const validCategory = Object.values(AchievementCategory).find(
    c => c.toLowerCase() === normalizedCategory
  );
  
  if (!validCategory) {
    console.warn(`Invalid achievement category: ${category}, defaulting to milestone`);
    return AchievementCategory.MILESTONE;
  }
  
  return validCategory;
};

/**
 * Maps database rank strings to TypeScript enum values
 */
export const mapToAchievementRank = (rank: string): AchievementRank => {
  const normalizedRank = rank.toUpperCase();
  const validRank = Object.values(AchievementRank).find(
    r => r.toUpperCase() === normalizedRank
  );
  
  if (!validRank) {
    console.warn(`Invalid achievement rank: ${rank}, defaulting to unranked`);
    return AchievementRank.UNRANKED;
  }
  
  return validRank;
};
