
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
  // Re-export the rest of the ranks with the same structure
  C: {
    // ... similar structure for Rank C
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
    // ... similar structure for Rank B
    workout: [],
    streak: [],
    record: [],
    variety: [],
    level: [],
    xp: []
  },
  A: {
    // ... similar structure for Rank A
    workout: [],
    streak: [],
    record: [],
    level: [],
    xp: []
  },
  S: {
    // ... similar structure for Rank S
    workout: [],
    streak: [],
    level: [],
    xp: [],
    special: []
  }
};
