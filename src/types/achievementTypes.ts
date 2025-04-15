
import { z } from 'zod';

export enum AchievementCategory {
  WORKOUT = 'workout',
  STREAK = 'streak',
  RECORD = 'record',
  XP = 'xp',
  LEVEL = 'level',
  GUILD = 'guild',
  SPECIAL = 'special',
  VARIETY = 'variety',
  MANUAL = 'manual',
  TIME_BASED = 'time_based',
  MILESTONE = 'milestone',
  WORKOUT_COUNT = 'workout_count',
  PERSONAL_RECORD = 'personal_record',
  SPORTS = 'sports',
  MOBILITY = 'mobility',
  CLASS = 'class',
  COMBO = 'combo'
}

export enum AchievementRank {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  UNRANKED = 'Unranked'
}

/**
 * Type guard and conversion functions for safer enum handling
 */
export const isValidCategory = (category: string): category is AchievementCategory => {
  return Object.values(AchievementCategory).includes(category as AchievementCategory);
};

export const isValidRank = (rank: string): rank is AchievementRank => {
  return Object.values(AchievementRank).includes(rank as AchievementRank);
};

/**
 * Safe conversion functions with logging
 */
export const toAchievementCategory = (category: string): AchievementCategory => {
  if (isValidCategory(category)) return category;
  console.warn(`Invalid achievement category: ${category}, defaulting to MILESTONE`);
  return AchievementCategory.MILESTONE;
};

export const toAchievementRank = (rank: string): AchievementRank => {
  if (isValidRank(rank)) return rank;
  console.warn(`Invalid achievement rank: ${rank}, defaulting to UNRANKED`);
  return AchievementRank.UNRANKED;
};

// Zod schema for achievement validation
export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(AchievementCategory),
  rank: z.nativeEnum(AchievementRank),
  points: z.number().int().positive(),
  xpReward: z.number().int().nonnegative(),
  iconName: z.string(),
  requirements: z.object({
    type: z.string(),
    value: z.number()
  })
});

export type Achievement = z.infer<typeof AchievementSchema>;
