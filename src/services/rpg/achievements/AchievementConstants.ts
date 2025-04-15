
/**
 * Achievement ID constants for achievements by rank
 */
export const ACHIEVEMENT_IDS = {
  // Rank E (basic) achievements
  E: {
    workout: ['first-workout', 'weekly-workouts', 'total-7'],
    streak: ['streak-3'],
    manual: ['manual-first', 'diario-do-suor'],
    guild: ['first-guild'],
    level: ['level-5']
  },
  // Rank D (moderate) achievements
  D: {
    workout: ['total-10'],
    streak: ['streak-7'],
    record: ['pr-first', 'pr-5'],
    variety: ['variety-3', 'exercise-variety-3'],
    manual: ['manual-5'],
    guild: ['multiple-guilds']
  },
  // Rank C (intermediate) achievements
  C: {
    workout: ['total-25'],
    streak: ['streak-14'],
    record: ['pr-10'],
    variety: ['exercise-variety-5', 'variety-5'],
    manual: ['manual-10'],
    xp: ['xp-1000']
  },
  // Rank B (advanced) achievements
  B: {
    workout: ['total-50'],
    streak: ['streak-30'],
    record: ['pr-25'],
    variety: ['exercise-variety-10'],
    xp: ['xp-5000']
  },
  // Rank A (expert) achievements
  A: {
    workout: ['total-100'],
    streak: ['streak-60'],
    record: ['pr-50'],
    xp: ['xp-10000']
  },
  // Rank S (legendary) achievements
  S: {
    workout: ['total-200'],
    streak: ['streak-100', 'streak-365'],
    xp: ['xp-50000', 'xp-100000']
  }
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
