
// This file now only contains type definitions and requirement constants
// Achievement IDs are managed in the database

export const ACHIEVEMENT_REQUIREMENTS = {
  workouts: {
    first: 1,
    weekly: 3,
    total: 7
  },
  streak: {
    basic: 3,
    intermediate: 7
  },
  manual: {
    basic: 3
  },
  RECORD: {
    COUNT_THRESHOLDS: [1, 5, 10, 25, 50]
  },
  XP: {
    MILESTONES: [1000, 5000, 10000, 50000, 100000]
  }
};

export enum AchievementErrorCategory {
  ACHIEVEMENT_NOT_FOUND = 'ACHIEVEMENT_NOT_FOUND',
  ACHIEVEMENT_ALREADY_AWARDED = 'ACHIEVEMENT_ALREADY_AWARDED',
  ACHIEVEMENT_AWARD_FAILED = 'ACHIEVEMENT_AWARD_FAILED',
  ACHIEVEMENT_FETCH_FAILED = 'ACHIEVEMENT_FETCH_FAILED',
  ACHIEVEMENT_PROGRESS_UPDATE_FAILED = 'ACHIEVEMENT_PROGRESS_UPDATE_FAILED',
  ACHIEVEMENT_MANUAL_WORKOUT_CHECK = 'ACHIEVEMENT_MANUAL_WORKOUT_CHECK'
}
