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
  COMBO = 'combo',
  POWER_DAY = 'power_day',
  CONSISTENCY = 'consistency',
  ACTIVITY = 'activity',
  EXERCISE_VARIETY = 'exercise_variety',
  ACHIEVEMENT = 'achievement',
  SOCIAL = 'social'
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
/**
 * Enhanced type guard for category validation with error handling
 */
export const isValidCategory = (category: string): category is AchievementCategory => {
  try {
    const normalizedInput = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return Object.values(AchievementCategory)
      .map(c => c.toLowerCase())
      .includes(normalizedInput);
  } catch (error) {
    console.error(`Invalid achievement category format: ${category}`, error);
    return false;
  }
};

export const isValidRank = (rank: string): rank is AchievementRank => {
  // Case insensitive check
  const normalizedInput = rank.toUpperCase();
  return Object.values(AchievementRank)
    .map(r => r.toUpperCase())
    .includes(normalizedInput);
};

/**
 * Enhanced safe conversion function with fallback and logging
 */
export const toAchievementCategory = (category: string): AchievementCategory => {
  try {
    const normalized = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (isValidCategory(normalized)) {
      return normalized as AchievementCategory;
    }
    console.warn(`Invalid achievement category: ${category}, defaulting to MILESTONE`);
    return AchievementCategory.MILESTONE;
  } catch (error) {
    console.error(`Error converting achievement category: ${category}`, error);
    return AchievementCategory.MILESTONE;
  }
};

export const toAchievementRank = (rank: string): AchievementRank => {
  const normalized = rank.toUpperCase();
  if (isValidRank(normalized)) {
    return normalized as AchievementRank;
  }
  console.warn(`Invalid achievement rank: ${rank}, defaulting to UNRANKED`);
  return AchievementRank.UNRANKED;
};

// Zod schema for achievement requirement validation
export const AchievementRequirementSchema = z.object({
  type: z.string(),
  value: z.number()
});

export type AchievementRequirement = z.infer<typeof AchievementRequirementSchema>;

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
  requirements: AchievementRequirementSchema,
  // Optional fields
  isUnlocked: z.boolean().optional(),
  achievedAt: z.string().optional(),
  stringId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  progress: z.object({
    current: z.number(),
    total: z.number()
  }).optional()
});

export type Achievement = z.infer<typeof AchievementSchema>;

export interface AchievementProgress {
  id: string;
  current: number;
  total: number;
  isComplete: boolean;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  points: number;
  byRank: Partial<Record<AchievementRank, number>>;
  byCategory: Partial<Record<AchievementCategory, number>>;
  recentlyUnlocked?: Achievement[];
}

export interface UserAchievementData {
  achievement_id: string;
  achieved_at: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    category: string;
    rank: string;
    points: number;
    xp_reward: number;
    icon_name: string;
    requirements: any;
    string_id?: string;
  };
}
