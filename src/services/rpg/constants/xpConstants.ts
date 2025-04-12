
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
  
  // Time-based XP tiers
  // These represent the maximum minutes for each tier and the XP for completing that entire tier
  TIME_XP_TIERS: [
    { minutes: 30, xp: 40 },  // 0-30 minutes: 40 XP total
    { minutes: 60, xp: 30 },  // 31-60 minutes: 30 XP additional
    { minutes: 90, xp: 20 },  // 61-90 minutes: 20 XP additional
    { minutes: Infinity, xp: 0 } // Beyond 90 minutes: 0 XP additional
  ],
  
  // Difficulty multipliers
  DIFFICULTY_MULTIPLIERS: {
    iniciante: 0.8,
    intermediario: 1.0,
    avancado: 1.2,
  },
  
  // Streak and bonus constants
  STREAK_BONUS_PER_DAY: 0.05,
  MAX_STREAK_DAYS: 7,
};
