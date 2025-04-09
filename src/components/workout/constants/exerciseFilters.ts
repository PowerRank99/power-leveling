
export const EQUIPMENT_TYPES = [
  'Todos',
  'Nenhum',
  'Barra',
  'Halter',
  'Kettlebell',
  'Máquina',
  'Banco',
  'Elástico',
  'TRX',
  'Cabo',
  'Outro',
  'Não especificado'
];

export const MUSCLE_GROUPS = [
  'Todos',
  'Abdômen',
  'Bíceps',
  'Costas',
  'Ombros',
  'Peito',
  'Pernas',
  'Tríceps',
  'Não especificado'
];

// Map for alternative muscle group names that should match to standard names
export const MUSCLE_GROUP_ALIASES = {
  'abdomen': 'Abdômen',
  'abdominal': 'Abdômen',
  'abs': 'Abdômen',
  'abdominais': 'Abdômen',
  'core': 'Abdômen',
  'bicep': 'Bíceps',
  'biceps': 'Bíceps',
  'back': 'Costas',
  'superior': 'Costas',
  'shoulder': 'Ombros',
  'shoulders': 'Ombros',
  'ombro': 'Ombros',
  'ombros': 'Ombros',
  'deltoides': 'Ombros',
  'chest': 'Peito',
  'peitoral': 'Peito',
  'legs': 'Pernas',
  'pernas': 'Pernas',
  'leg': 'Pernas',
  'coxa': 'Pernas',
  'coxas': 'Pernas',
  'quads': 'Pernas',
  'quadríceps': 'Pernas',
  'tricep': 'Tríceps',
  'triceps': 'Tríceps'
};

// Map for alternative equipment types that should match to standard names
export const EQUIPMENT_TYPE_ALIASES = {
  'bodyweight': 'Nenhum',
  'corpo': 'Nenhum',
  'none': 'Nenhum',
  'sem equipamento': 'Nenhum',
  'barbell': 'Barra',
  'dumbbell': 'Halter',
  'dumbbells': 'Halter',
  'halteres': 'Halter',
  'machine': 'Máquina',
  'maquina': 'Máquina',
  'máquina': 'Máquina',
  'kettle': 'Kettlebell',
  'kb': 'Kettlebell',
  'bench': 'Banco',
  'band': 'Elástico',
  'bands': 'Elástico',
  'elastic': 'Elástico',
  'elastico': 'Elástico',
  'resistance band': 'Elástico',
  'suspension': 'TRX',
  'cable': 'Cabo',
  'pulley': 'Cabo',
  'other': 'Outro'
};
