
/**
 * Achievement ID constants for basic achievements
 */
export const ACHIEVEMENT_IDS = {
  FIRST_WORKOUT: 'first-workout',
  WEEKLY_THREE: 'weekly-workouts',
  FIRST_STREAK: 'streak-3',
  FIRST_PR: 'pr-first',
  LEVEL_FIVE: 'level-5',
  FIRST_GUILD: 'first-guild',
  FIRST_MANUAL: 'manual-first',
  XP_MILESTONE_1000: 'xp-1000'
};

/**
 * Achievement requirement constants
 */
export const ACHIEVEMENT_REQUIREMENTS = {
  WORKOUT: {
    FIRST: 1,
    WEEKLY: 3,
    BASIC_TOTAL: 7
  },
  STREAK: {
    BASIC: 3,
    INTERMEDIATE: 7
  },
  RECORD: {
    COUNT_THRESHOLDS: [1, 5, 10, 25, 50]
  },
  XP: {
    MILESTONES: [1000, 5000, 10000, 50000, 100000]
  }
};

/**
 * Error categories for achievement related operations
 */
export enum AchievementErrorCategory {
  ACHIEVEMENT_NOT_FOUND = 'ACHIEVEMENT_NOT_FOUND',
  ACHIEVEMENT_ALREADY_AWARDED = 'ACHIEVEMENT_ALREADY_AWARDED',
  ACHIEVEMENT_AWARD_FAILED = 'ACHIEVEMENT_AWARD_FAILED',
  ACHIEVEMENT_FETCH_FAILED = 'ACHIEVEMENT_FETCH_FAILED',
  ACHIEVEMENT_PROGRESS_UPDATE_FAILED = 'ACHIEVEMENT_PROGRESS_UPDATE_FAILED',
  ACHIEVEMENT_MANUAL_WORKOUT_CHECK = 'ACHIEVEMENT_MANUAL_WORKOUT_CHECK'
}
