
/**
 * Achievement requirement constants that don't depend on database values
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

/**
 * @deprecated This mapping should not be used directly. 
 * Use AchievementIdentifierUtils or AchievementIdentifierService instead.
 * These string IDs are being migrated to the database as the source of truth.
 */
export const ACHIEVEMENT_IDS = {
  E: {
    workout: [
      'primeiro-treino', // first-workout
      'trio-na-semana',  // weekly-3
      'embalo-fitness'   // total-7
    ],
    streak: ['trinca-poderosa'], // streak-3
    manual: ['diario-do-suor'],  // manual-3
    variety: ['aventuras-fitness']
  },
  D: {
    workout: [
      'maratona-mensal',  // monthly-10
      'relógio-do-suor'   // total-hours-3
    ],
    streak: ['semana-impecavel'], // streak-7
    record: [
      'quebra-recorde',    // pr-first
      'recordista-basico'  // pr-5
    ],
    manual: ['manual-na-veia-basico'], // manual-5
    variety: [
      'combo-fitness',     // variety-3
      'exercicios-variados' // exercise-variety-3
    ]
  },
  C: {
    workout: [
      'cardio-sem-folego',  // cardio-10
      'forca-de-guerreiro', // strength-10
      'guru-do-alongamento' // mobility-10
    ],
    streak: ['corrida-continua'], // streak-14
    record: ['recordista-experiente'], // pr-10
    manual: ['manual-na-veia'], // manual-10
    variety: [
      'multi-exercicio', // exercise-variety-5
      'versatilidade'    // variety-5
    ]
  },
  B: {
    workout: [
      'dedicacao-fitness', // 30-workouts
      'maratonista',      // 30-cardio
      'mestre-da-forca'   // 30-strength
    ],
    streak: ['mes-perfeito'], // streak-30
    record: ['recordista-avancado'], // pr-25
    variety: ['arsenal-de-movimentos'] // exercise-variety-10
  },
  A: {
    workout: [
      'lendario-fitness', // 100-workouts
      'corredor-elite',   // 50-cardio
      'titan-da-forca'    // 50-strength
    ],
    streak: ['habito-forjado'], // streak-60
    record: ['recordista-elite'], // pr-50
  },
  S: {
    workout: [
      'imortal-fitness',   // 365-workouts
      'maratonista-olimpico' // 100-cardio
    ],
    streak: [
      'inquebrado',      // streak-100
      'lenda-do-compromisso' // streak-365
    ]
  }
};
