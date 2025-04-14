
import { XPTimeTier } from '../types/xpTypes';

/**
 * Constants for XP calculations
 */
export const XP_CONSTANTS = {
  /** Daily XP cap (300 XP) */
  DAILY_XP_CAP: 300,
  
  /** Power day XP cap (500 XP) */
  POWER_DAY_XP_CAP: 500,
  
  /** XP bonus for achieving a personal record */
  PR_BONUS_XP: 50,
  
  /** Base XP per exercise */
  BASE_EXERCISE_XP: 5,
  
  /** Base XP per completed set */
  BASE_SET_XP: 2,
  
  /** Maximum number of sets that contribute to XP (anti-abuse) */
  MAX_XP_CONTRIBUTING_SETS: 10,
  
  /** Maximum streak bonus days */
  MAX_STREAK_DAYS: 7,
  
  /** Per-day streak bonus percentage (as decimal) */
  STREAK_BONUS_PER_DAY: 0.05,
  
  /** Diminishing returns tiers for time-based XP */
  TIME_XP_TIERS: [
    { minutes: 30, xp: 40 },
    { minutes: 60, xp: 30 },
    { minutes: 90, xp: 20 },
    { minutes: Infinity, xp: 0 }
  ] as XPTimeTier[]
};
