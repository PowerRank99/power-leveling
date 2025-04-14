
import { AchievementCategory } from '@/types/achievementTypes';

/**
 * Constants for achievement IDs organized by rank and category
 */
export const ACHIEVEMENT_IDS = {
  E: {
    [AchievementCategory.WORKOUT]: ['first-workout', 'weekly-3', 'total-7'],
    [AchievementCategory.STREAK]: ['streak-3'],
    [AchievementCategory.GUILD]: ['first-guild'],
    [AchievementCategory.MANUAL]: ['manual-3'],
    [AchievementCategory.VARIETY]: ['activity-variety-3']
  },
  D: {
    [AchievementCategory.WORKOUT]: ['total-10'],
    [AchievementCategory.STREAK]: ['streak-7'],
    [AchievementCategory.GUILD]: ['multiple-guilds'],
    [AchievementCategory.MANUAL]: ['manual-10'],
    [AchievementCategory.RECORD]: ['pr-first', 'pr-5'],
    [AchievementCategory.VARIETY]: ['activity-variety-5', 'exercise-variety-3']
  },
  C: {
    [AchievementCategory.WORKOUT]: ['total-25'],
    [AchievementCategory.STREAK]: ['streak-14'],
    [AchievementCategory.RECORD]: ['pr-10'],
    [AchievementCategory.VARIETY]: ['exercise-variety-5'],
    [AchievementCategory.XP]: ['xp-1000']
  },
  B: {
    [AchievementCategory.WORKOUT]: ['total-50'],
    [AchievementCategory.STREAK]: ['streak-30'],
    [AchievementCategory.RECORD]: ['pr-25'],
    [AchievementCategory.VARIETY]: ['exercise-variety-10'],
    [AchievementCategory.XP]: ['xp-5000']
  },
  A: {
    [AchievementCategory.WORKOUT]: ['total-100'],
    [AchievementCategory.STREAK]: ['streak-60'],
    [AchievementCategory.RECORD]: ['pr-50'],
    [AchievementCategory.XP]: ['xp-10000']
  },
  S: {
    [AchievementCategory.WORKOUT]: ['total-200'],
    [AchievementCategory.STREAK]: ['streak-100', 'streak-365'],
    [AchievementCategory.XP]: ['xp-50000', 'xp-100000']
  },
  Unranked: {
    [AchievementCategory.SPECIAL]: ['beta-tester', 'early-adopter']
  }
};

/**
 * Achievement requirements by type
 */
export const ACHIEVEMENT_REQUIREMENTS = {
  STREAK: {
    MIN_STREAK_FOR_ACHIEVEMENT: 3,
    STREAK_THRESHOLDS: [3, 7, 14, 30, 60, 100, 365]
  },
  WORKOUT: {
    COUNT_THRESHOLDS: [1, 7, 10, 25, 50, 100, 200],
    WEEKLY_THRESHOLDS: [3, 5, 7]
  },
  RECORD: {
    COUNT_THRESHOLDS: [1, 5, 10, 25, 50]
  },
  XP: {
    MILESTONES: [1000, 5000, 10000, 50000, 100000]
  },
  GUILD: {
    COUNT_THRESHOLDS: [1, 3, 5]
  }
};
