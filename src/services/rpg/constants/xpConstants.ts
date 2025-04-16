
/**
 * Constants related to XP calculations
 */
export const XP_CONSTANTS = {
  // XP system constants
  DAILY_XP_CAP: 300,
  PR_BONUS_XP: 50, // Bonus XP for personal records
  BASE_EXERCISE_XP: 5, // XP per exercise
  BASE_SET_XP: 2, // XP per set
  MAX_XP_CONTRIBUTING_SETS: 10, // Maximum number of sets that contribute to XP
  MAX_XP_CONTRIBUTING_EXERCISES: 8, // Maximum number of exercises that contribute to XP
  
  // Time-based XP with diminishing returns
  TIME_XP_TIERS: [
    { minutes: 30, xp: 40 },  // First 30 minutes: 40 XP
    { minutes: 60, xp: 30 },  // 31-60 minutes: +30 XP
    { minutes: 90, xp: 20 },  // 61-90 minutes: +20 XP
    { minutes: Infinity, xp: 0 } // Beyond 90 minutes: +0 XP (no additional XP)
  ],
  
  // Streak and bonus constants
  STREAK_BONUS_PER_DAY: 0.05,
  MAX_STREAK_DAYS: 7,
};
