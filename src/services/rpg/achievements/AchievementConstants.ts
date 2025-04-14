/**
 * Achievement ID constants grouped by rank and category
 */
export const ACHIEVEMENT_IDS = {
  // Rank E achievements (basic)
  E: {
    workout: [
      'primeiro-treino',   // Complete first workout
      'trio-na-semana',    // 3 workouts in a week
      'embalo-fitness'     // 7 total workouts
    ],
    streak: [
      'trinca-poderosa'    // 3 consecutive days
    ],
    sports: [
      'esporte-de-primeira' // First sports workout
    ],
    manual: [
      'diario-do-suor'     // 3 manual workouts
    ],
    mobility: [
      'alongamento-na-veia' // 3 mobility/flexibility sessions
    ],
    level: [
      'heroi-em-ascensao'  // Reach level 5
    ],
    guild: [
      'primeira-guilda'    // Join first guild
    ],
    variety: []
  },
  // Rank D achievements
  D: {
    workout: [
      'total-10',          // 10 total workouts
      'early-morning'      // Complete workout before 7am
    ],
    streak: [
      'streak-7'           // 7 consecutive days
    ],
    manual: [
      'manual-5'           // 5 manual workouts
    ],
    record: [
      'pr-first',          // First personal record
      'pr-5'               // 5 personal records
    ],
    level: [
      'level-10'           // Reach level 10
    ],
    guild: [
      'guild-quest-first', // First guild quest
      'multiple-guilds'    // Join 3+ guilds
    ],
    variety: [
      'variety-3',         // 3 types of workouts
      'exercise-variety-3' // 3 different exercises
    ],
    xp: [
      'xp-1000'            // 1,000 XP accumulated
    ]
  },
  // Rank C achievements
  C: {
    workout: [
      'total-25',          // 25 total workouts
      'workout-60min-10'   // 10 workouts over 60 minutes
    ],
    streak: [
      'streak-14'          // 14 consecutive days
    ],
    record: [
      'pr-10'              // 10 personal records
    ],
    manual: [
      'manual-10'          // 10 manual workouts
    ],
    variety: [
      'workout-types-weekly-4', // 4 workout types in a week
      'variety-5'          // 5 types of exercises
    ],
    guild: [
      'guild-quest-3'      // 3 guild quests
    ],
    level: [
      'level-25'           // Reach level 25
    ],
    xp: [
      'xp-5000'            // 5,000 XP accumulated
    ]
  },
  // Rank B achievements
  B: {
    workout: [
      'total-50'           // 50 total workouts
    ],
    streak: [
      'streak-30'          // 30 consecutive days
    ],
    record: [
      'pr-25'              // 25 personal records
    ],
    variety: [
      'variety-10'         // 10 types of exercises
    ],
    level: [
      'level-50'           // Reach level 50
    ],
    xp: [
      'xp-10000'           // 10,000 XP accumulated
    ]
  },
  // Rank A achievements
  A: {
    workout: [
      'total-100'          // 100 total workouts
    ],
    streak: [
      'streak-60'          // 60 consecutive days
    ],
    record: [
      'pr-50'              // 50 personal records
    ],
    level: [
      'level-75'           // Reach level 75
    ],
    xp: [
      'xp-50000'           // 50,000 XP accumulated
    ]
  },
  // Rank S achievements (legendary)
  S: {
    workout: [
      'total-200'          // 200 total workouts
    ],
    streak: [
      'streak-100',        // 100 consecutive days
      'streak-365'         // 365 consecutive days
    ],
    level: [
      'level-99'           // Reach level 99 (max)
    ],
    xp: [
      'xp-50000',          // 50,000 XP accumulated
      'xp-100000'          // 100,000 XP accumulated
    ],
    special: [
      'supreme-power'      // Unlock all other achievements
    ]
  }
};

/**
 * Achievement requirements for various achievements
 */
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
  },
  // Other requirement definitions...
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
