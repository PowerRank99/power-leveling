/**
 * Achievement ID constants grouped by rank and category
 */
export const ACHIEVEMENT_IDS = {
  // Rank E achievements (basic)
  E: {
    workout: [
      'first_workout',     // Complete first workout
      'total-7',          // 7 total workouts
      'weekly-3'          // 3 workouts in a week
    ],
    streak: [
      'streak-3'          // 3 consecutive days
    ],
    sports: [
      'sport-first'       // First sports workout
    ],
    manual: [
      'manual-first'      // First manual workout
    ],
    mobility: [
      'mobility-3'        // 3 mobility/flexibility sessions
    ],
    level: [
      'level-5'          // Reach level 5
    ],
    guild: [
      'guild-first'       // Join first guild
    ]
  },
  // Rank D achievements
  D: {
    workout: [
      'total-10',         // 10 total workouts
      'early-morning'     // Complete workout before 7am
    ],
    streak: [
      'streak-7'          // 7 consecutive days
    ],
    manual: [
      'manual-5'          // 5 manual workouts
    ],
    record: [
      'pr-first',         // First personal record
      'pr-5'              // 5 personal records
    ],
    level: [
      'level-10'          // Reach level 10
    ],
    guild: [
      'guild-quest-first', // First guild quest
      'guild-3'           // Join 3+ guilds
    ],
    variety: [
      'variety-3',        // 3 types of workouts
      'exercise-3'        // 3 different exercises
    ],
    xp: [
      'xp-1000'           // 1,000 XP accumulated
    ]
  },
  // Keep same structure for other ranks
  C: {
    workout: [],
    streak: [],
    record: [],
    manual: [],
    variety: [],
    guild: [],
    level: [],
    xp: []
  },
  B: {
    workout: [],
    streak: [],
    record: [],
    variety: [],
    level: [],
    xp: []
  },
  A: {
    workout: [],
    streak: [],
    record: [],
    level: [],
    xp: []
  },
  S: {
    workout: [],
    streak: [],
    level: [],
    xp: [],
    special: []
  }
};
