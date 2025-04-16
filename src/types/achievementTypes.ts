
/**
 * This is a placeholder file for the removed achievement system.
 * These types are preserved to prevent type errors in remaining code.
 */

export enum AchievementCategory {
  WORKOUT = 'workout',
  STREAK = 'streak',
  RECORD = 'record',
  MANUAL = 'manual',
  SPECIAL = 'special',
  GUILD = 'guild',
  RANK_E = 'rank_e',
  RANK_D = 'rank_d'
}

export enum AchievementRank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rank: AchievementRank;
  points: number;
  xpReward: number;
  iconName: string;
  requirements: {
    type: string;
    value: number;
    [key: string]: any;
  };
  isUnlocked?: boolean;
  metadata?: Record<string, any>;
}

export const toAchievementCategory = (category: string): AchievementCategory => {
  return Object.values(AchievementCategory).includes(category as AchievementCategory)
    ? (category as AchievementCategory)
    : AchievementCategory.SPECIAL;
};

export const toAchievementRank = (rank: string): AchievementRank => {
  return Object.values(AchievementRank).includes(rank as AchievementRank)
    ? (rank as AchievementRank)
    : AchievementRank.E;
};
