
/**
 * Exercise type classifications for class bonuses
 */
export const EXERCISE_TYPES = {
  // For Guerreiro
  COMPOUND_LIFTS: [
    'squat', 'deadlift', 'bench', 'press', 'clean', 'jerk', 'snatch', 
    'agachamento', 'levantamento', 'supino', 'arranco', 'terra'
  ],
  
  // For Monge
  BODYWEIGHT: [
    'pullup', 'pushup', 'dip', 'burpee', 'plank', 'barra', 'flexão', 
    'prancha', 'muscle up', 'abs', 'abdominais', 'calistenia'
  ],
  
  // For Ninja
  CARDIO_HIIT: [
    'run', 'sprint', 'cardio', 'hit', 'hiit', 'interval', 'corrida', 
    'bike', 'bicycle', 'bicicleta', 'jump', 'pular'
  ],
  
  // For Bruxo
  FLEXIBILITY: [
    'yoga', 'stretch', 'flexibility', 'flexibilidade', 'alongamento',
    'mobility', 'mobilidade', 'pilates'
  ],
  
  // For Paladino
  SPORTS: [
    'soccer', 'football', 'basketball', 'tennis', 'volleyball', 'basquete',
    'futebol', 'tênis', 'vôlei', 'esporte', 'jogo', 'ball', 'bola'
  ],
  
  // For Druida - mobility & flexibility exercises
  MOBILITY: [
    'mobility', 'mobilidade', 'yoga', 'stretching', 'flexibility', 'flexibilidade',
    'alongamento', 'pilates', 'balance', 'equilíbrio', 'meditation', 'meditação'
  ]
};

/**
 * Class passive skills names and descriptions
 */
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
    PRIMARY: 'Pijama Arcano',
    SECONDARY: 'Topo da Montanha'
  },
  PALADINO: {
    PRIMARY: 'Caminho do Herói',
    SECONDARY: 'Camisa 10'
  },
  DRUIDA: {
    PRIMARY: 'Ritmo da Natureza',
    SECONDARY: 'Cochilada Mística'
  }
};
