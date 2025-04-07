
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
  'Deltoides',
  'Peito',
  'Quadríceps',
  'Tríceps',
  'Não especificado'
];

// Map for alternative muscle group names that should match to standard names
export const MUSCLE_GROUP_ALIASES = {
  'abdomen': 'Abdômen',
  'abdominal': 'Abdômen',
  'abs': 'Abdômen',
  'abdominais': 'Abdômen',
  'biceps': 'Bíceps',
  'back': 'Costas',
  'superior': 'Costas',
  'ombro': 'Deltoides',
  'ombros': 'Deltoides',
  'shoulders': 'Deltoides',
  'chest': 'Peito',
  'peitoral': 'Peito',
  'legs': 'Quadríceps',
  'pernas': 'Quadríceps',
  'leg': 'Quadríceps',
  'coxa': 'Quadríceps',
  'coxas': 'Quadríceps',
  'quads': 'Quadríceps',
  'triceps': 'Tríceps'
};

// Map for alternative equipment types that should match to standard names
export const EQUIPMENT_TYPE_ALIASES = {
  'bodyweight': 'Nenhum',
  'corpo': 'Nenhum',
  'barbell': 'Barra',
  'dumbbell': 'Halter',
  'machine': 'Máquina',
  'bench': 'Banco',
  'band': 'Elástico',
  'resistance band': 'Elástico',
  'suspension': 'TRX',
  'cable': 'Cabo',
  'other': 'Outro'
};
