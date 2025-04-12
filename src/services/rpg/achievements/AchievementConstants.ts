
/**
 * Achievement system constants and predefined values
 */

import { AchievementRank } from '@/types/achievementTypes';

/**
 * Achievement rank thresholds using the formula:
 * Rank Score = 1.5 × Level + 2 × (Achievement Points)
 */
export const RANK_THRESHOLDS = {
  S: 198,
  A: 160,
  B: 120,
  C: 80,
  D: 50,
  E: 20,
  Unranked: 0
};

/**
 * Achievement categories to group achievements
 */
export const ACHIEVEMENT_CATEGORIES = {
  WORKOUT: 'workout',
  STREAK: 'streak',
  RECORD: 'record',
  XP: 'xp',
  LEVEL: 'level',
  GUILD: 'guild',
  SPECIAL: 'special',
  VARIETY: 'variety',
  MANUAL: 'manual'
};

/**
 * Achievement point values by rank
 */
export const ACHIEVEMENT_POINTS = {
  S: 25,
  A: 15,
  B: 10,
  C: 5,
  D: 3,
  E: 1
};

/**
 * Achievement IDs organized by rank and category
 * This helps with systematic checking of achievements
 */
export const ACHIEVEMENT_IDS = {
  // Rank E Achievements
  E: {
    WORKOUT: [
      'first-workout',
      'weekly-3',
      'total-7'
    ],
    STREAK: [
      'streak-3'
    ],
    GUILD: [
      'first-guild'
    ],
    MANUAL: [
      'manual-first'
    ]
  },
  
  // Rank D Achievements
  D: {
    WORKOUT: [
      'total-10',
      'early-morning',
      'monthly-10'
    ],
    STREAK: [
      'streak-7'
    ],
    RECORD: [
      'pr-first',
      'pr-5'
    ],
    GUILD: [
      'guild-quest-first',
      'multiple-guilds'
    ],
    XP: [
      'xp-1000'
    ],
    LEVEL: [
      'level-10'
    ],
    VARIETY: [
      'variety-3',
      'workout-types-3'
    ],
    MANUAL: [
      'manual-5'
    ]
  },
  
  // Rank C Achievements
  C: {
    WORKOUT: [
      'total-25',
      'workout-60min-10'
    ],
    STREAK: [
      'streak-14'
    ],
    RECORD: [
      'pr-10',
      'pr-increase-10'
    ],
    GUILD: [
      'guild-quest-3'
    ],
    XP: [
      'xp-5000'
    ],
    LEVEL: [
      'level-25'
    ],
    VARIETY: [
      'variety-5',
      'workout-types-weekly-4'
    ],
    MANUAL: [
      'manual-10'
    ]
  },
  
  // Rank B Achievements
  B: {
    WORKOUT: [
      'total-50'
    ],
    STREAK: [
      'streak-30'
    ],
    RECORD: [
      'pr-25',
      'pr-increase-20'
    ],
    XP: [
      'xp-10000'
    ],
    LEVEL: [
      'level-50'
    ],
    VARIETY: [
      'variety-10'
    ],
    MANUAL: [
      'manual-25'
    ]
  },
  
  // Rank A Achievements
  A: {
    WORKOUT: [
      'total-100'
    ],
    STREAK: [
      'streak-60'
    ],
    RECORD: [
      'pr-50'
    ],
    XP: [
      'xp-50000'
    ],
    LEVEL: [
      'level-75'
    ]
  },
  
  // Rank S Achievements
  S: {
    WORKOUT: [
      'total-200'
    ],
    STREAK: [
      'streak-100',
      'streak-365'
    ],
    XP: [
      'xp-100000'
    ],
    LEVEL: [
      'level-99'
    ],
    SPECIAL: [
      'supreme-power'
    ]
  }
};
