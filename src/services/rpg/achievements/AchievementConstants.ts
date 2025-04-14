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
    ]
  },
  // Other ranks would be included similarly...
  D: {
    // Definitions for rank D achievements
    workout: [],
    streak: [],
    // ... etc
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
  // Other requirement definitions...
};
