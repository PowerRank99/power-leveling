
/**
 * Achievement ID constants grouped by rank and category
 */
export const ACHIEVEMENT_IDS = {
  // Rank E achievements (basic)
  E: {
    workout: [
      'primeiro-treino',     // Complete first workout
      'embalo-fitness',      // 7 total workouts
      'trio-na-semana'       // 3 workouts in a week
    ],
    streak: [
      'trinca-poderosa'      // 3 consecutive days
    ],
    sports: [
      'esporte-de-primeira'  // First sports workout
    ],
    manual: [
      'diario-do-suor'      // First manual workout
    ],
    mobility: [
      'alongamento-na-veia'  // 3 mobility/flexibility sessions
    ],
    level: [
      'heroi-em-ascensao'   // Reach level 5
    ],
    guild: [
      'primeira-guilda'     // Join first guild
    ]
  },
  // Rank D achievements
  D: {
    workout: [
      'dedicacao-inicial',    // 10 total workouts
      'levanta-e-racha'      // Complete workout before 7am
    ],
    streak: [
      'semana-perfeita'      // 7 consecutive days
    ],
    manual: [
      'aventuras-fitness'    // 5 manual workouts
    ],
    record: [
      'quebra-recorde',      // First personal record
      'quebrando-barreiras'  // 5 personal records
    ],
    level: [
      'subida-poderosa'     // Reach level 10
    ],
    guild: [
      'quest-de-guilda',    // First guild quest
      'amigo-de-guilda'     // Join 3+ guilds
    ],
    variety: [
      'combo-fitness',      // 3 types of workouts
      'exercicios-variados' // 3 different exercises
    ],
    xp: [
      'primeiro-milhar'     // 1,000 XP accumulated
    ]
  },
  // Rank C achievements
  C: {
    workout: [
      'persistencia',         // 25 total workouts
      'maratonista'          // 10 workouts over 60 minutes
    ],
    streak: [
      'duas-semanas-de-fogo' // 14 consecutive days
    ],
    record: [
      'recordista-experiente' // 10 personal records
    ],
    manual: [
      'manual-na-veia'       // 10 manual workouts
    ],
    variety: [
      'semana-multitarefa',  // 4 workout types in a week
      'experiencia-completa' // 5 types of exercises
    ],
    guild: [
      'power-guildo'         // 3 guild quests
    ],
    level: [
      'dedicacao-total'      // Reach level 25
    ],
    xp: [
      'cinco-mil'            // 5,000 XP accumulated
    ]
  },
  // Rank B achievements
  B: {
    workout: [
      'metade-do-caminho'    // 50 total workouts
    ],
    streak: [
      'um-mes-invicto'       // 30 consecutive days
    ],
    record: [
      'recordista-dedicado'  // 25 personal records
    ],
    variety: [
      'enciclopedia-fitness' // 10 types of exercises
    ],
    level: [
      'meio-caminho'         // Reach level 50
    ],
    xp: [
      'dez-mil'              // 10,000 XP accumulated
    ]
  },
  // Rank A achievements
  A: {
    workout: [
      'centenario'           // 100 total workouts
    ],
    streak: [
      'dois-meses-implacaveis' // 60 consecutive days
    ],
    record: [
      'mestre-dos-recordes'   // 50 personal records
    ],
    level: [
      'quase-la'              // Reach level 75
    ],
    xp: [
      'cinquenta-mil'         // 50,000 XP accumulated
    ]
  },
  // Rank S achievements
  S: {
    workout: [
      'dedicacao-lendaria'    // 200 total workouts
    ],
    streak: [
      'centenario-do-fogo',   // 100 consecutive days
      'um-ano-de-lenda'       // 365 consecutive days
    ],
    level: [
      'o-apice'               // Reach level 99 (max)
    ],
    xp: [
      'cinquenta-mil',        // 50,000 XP accumulated
      'cem-mil'               // 100,000 XP accumulated
    ],
    special: [
      'poder-supremo'         // Unlock all other achievements
    ]
  }
};
