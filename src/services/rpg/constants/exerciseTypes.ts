
/**
 * Exercise type classifications for class bonuses
 */
export const EXERCISE_TYPES = {
  COMPOUND_LIFTS: ['squat', 'deadlift', 'bench press', 'agachamento', 'levantamento terra', 'supino'],
  BODYWEIGHT: ['push-up', 'pull-up', 'dip', 'flexão', 'barra', 'paralela', 'bodyweight', 'calistenia'],
  CARDIO_HIIT: ['run', 'sprint', 'jog', 'cycle', 'cardio', 'hiit', 'corrida', 'ciclismo', 'bicicleta', 'intervalo'],
  FLEXIBILITY: ['yoga', 'stretch', 'mobility', 'flexibility', 'alongamento', 'mobilidade', 'flexibilidade'],
  RECOVERY: ['foam roll', 'massage', 'recovery', 'recuperação', 'massagem', 'mobilidade'],
  SPORTS: ['soccer', 'basketball', 'volleyball', 'tennis', 'futebol', 'basquete', 'vôlei', 'tênis', 'esporte']
};

// Class passive skill names
export const CLASS_PASSIVE_SKILLS = {
  GUERREIRO: {
    PRIMARY: 'Força Bruta',
    SECONDARY: 'Saindo da Jaula'
  },
  MONGE: {
    PRIMARY: 'Força Interior',
    SECONDARY: 'Discípulo do Algoritmo'
  },
  NINJA: {
    PRIMARY: 'Forrest Gump',
    SECONDARY: 'HIIT & Run'
  },
  BRUXO: {
    PRIMARY: 'Fluxo Arcano',
    SECONDARY: 'Folga Mística'
  },
  PALADINO: {
    PRIMARY: 'Caminho do Herói',
    SECONDARY: 'Camisa 10'
  }
};
