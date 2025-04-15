
/**
 * Achievement categories enum for better type safety
 */
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
  // Add missing categories for completeness
  SPORTS = 'sports',
  MOBILITY = 'mobility',
  CLASS = 'class',
  COMBO = 'combo'
}

/**
 * Achievement rank enum with clear definitions
 */
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
 * Type guard functions for safer type conversions
 */
export const isValidCategory = (category: string): category is AchievementCategory => {
  return Object.values(AchievementCategory).includes(category as AchievementCategory);
};

export const isValidRank = (rank: string): rank is AchievementRank => {
  return Object.values(AchievementRank).includes(rank as AchievementRank);
};

/**
 * Safe conversion functions to convert string values to enum values
 */
export const toAchievementCategory = (category: string): AchievementCategory => {
  if (isValidCategory(category)) {
    return category;
  }
  console.warn(`Invalid achievement category: ${category}, defaulting to MILESTONE`);
  return AchievementCategory.MILESTONE;
};

export const toAchievementRank = (rank: string): AchievementRank => {
  if (isValidRank(rank)) {
    return rank;
  }
  console.warn(`Invalid achievement rank: ${rank}, defaulting to UNRANKED`);
  return AchievementRank.UNRANKED;
};

/**
 * Strongly typed requirement structure
 */
export interface AchievementRequirement {
  type: string;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Achievement interface for consistent usage across the app
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory | string;
  rank: AchievementRank | string;
  points: number;
  xpReward: number;
  iconName: string;
  requirements: AchievementRequirement;
  stringId?: string; // For backward compatibility
  isUnlocked?: boolean;
  achievedAt?: string;
  metadata?: Record<string, any>; // For future extensibility
}

/**
 * Achievement progress interface
 */
export interface AchievementProgress {
  id: string;
  current: number;
  total: number;
  isComplete: boolean;
  lastUpdated?: string;
}

/**
 * Achievement notification interface
 */
export interface AchievementNotification {
  id: string;
  achievement?: Achievement;
  title?: string;
  description?: string;
  rank: AchievementRank | string;
  points: number;
  xpReward: number;
  bonusText?: string;
  iconName?: string;
  timestamp: string;
}

/**
 * Achievement stats interface for user profiles
 */
export interface AchievementStats {
  total: number;
  unlocked: number;
  points: number;
  byRank: Record<AchievementRank | string, number>;
  byCategory: Partial<Record<AchievementCategory | string, number>>;
  recentlyUnlocked?: Achievement[];
}

/**
 * Achievement service response interface
 */
export interface AchievementBatchResult {
  successful?: string[];
  failed?: string[];
  alreadyAwarded?: string[];
}

// Update UserAchievementData interface to match Supabase query structure
export interface UserAchievementData {
  achievement_id: string;
  achieved_at: string;
  achievements: {
    id: string;
    name: string;
    description: string;
    category: string;
    rank: string;
    points: number;
    xp_reward: number;
    icon_name: string;
    string_id?: string;
    requirements: AchievementRequirement;
  };
}
