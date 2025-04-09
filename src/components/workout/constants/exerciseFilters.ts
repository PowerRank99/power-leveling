export const EQUIPMENT_TYPES = [
  'Todos',
  'Nenhum',
  'Barra de Cardio',
  'Equipamento de Esportes',
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
  'Cardio',
  'Costas',
  'Esportes',
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
  'bícep': 'Bíceps',
  'bíceps': 'Bíceps',
  'curl': 'Bíceps',
  'rosca': 'Bíceps',
  'antebraço': 'Bíceps',
  'antebracos': 'Bíceps',
  'antebraços': 'Bíceps',
  'braco': 'Bíceps',
  'braço': 'Bíceps',
  
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
  'triceps': 'Tríceps',
  'trícep': 'Tríceps',
  'tricep': 'Tríceps',
  'extensão': 'Tríceps',
  'extensao': 'Tríceps',
  'pushdown': 'Tríceps',
  'francês': 'Tríceps',
  'frances': 'Tríceps',
  'mergulho': 'Tríceps',
  'paralela': 'Tríceps',
  'testa': 'Tríceps',
  'coice': 'Tríceps',
  'corda': 'Tríceps',
  'banco': 'Tríceps',
  'diamante': 'Tríceps',
  
  'cardio': 'Cardio',
  'aerobic': 'Cardio',
  'aerobico': 'Cardio',
  'aeróbico': 'Cardio',
  'endurance': 'Cardio',
  'resistencia': 'Cardio',
  'resistência': 'Cardio',
  'corrida': 'Cardio',
  'correr': 'Cardio',
  'esteira': 'Cardio',
  'ciclismo': 'Cardio',
  'bike': 'Cardio',
  'bicicleta': 'Cardio',
  'remo': 'Cardio',
  'pular': 'Cardio',
  'corda': 'Cardio',
  'jump': 'Cardio',
  'rope': 'Cardio',
  'elliptical': 'Cardio',
  'eliptico': 'Cardio',
  'elíptico': 'Cardio',
  'spinning': 'Cardio',
  'aerobica': 'Cardio',
  'aeróbica': 'Cardio',
  
  'sport': 'Esportes',
  'esporte': 'Esportes',
  'sports': 'Esportes',
  'futebol': 'Esportes',
  'soccer': 'Esportes',
  'football': 'Esportes',
  'basquete': 'Esportes',
  'basketball': 'Esportes',
  'volei': 'Esportes',
  'vôlei': 'Esportes',
  'volley': 'Esportes',
  'volleyball': 'Esportes',
  'tenis': 'Esportes',
  'tênis': 'Esportes',
  'tennis': 'Esportes',
  'natação': 'Esportes',
  'natacao': 'Esportes',
  'swimming': 'Esportes',
  'handball': 'Esportes',
  'handebol': 'Esportes',
  'boxe': 'Esportes',
  'boxing': 'Esportes',
  'luta': 'Esportes',
  'martial': 'Esportes',
  'golf': 'Esportes',
  'golfe': 'Esportes',
  'rugby': 'Esportes',
  'badminton': 'Esportes',
  'squash': 'Esportes'
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
  'other': 'Outro',
  'treadmill': 'Barra de Cardio',
  'esteira': 'Barra de Cardio',
  'bike': 'Barra de Cardio',
  'bicycle': 'Barra de Cardio',
  'bicicleta': 'Barra de Cardio',
  'ergometrica': 'Barra de Cardio',
  'ergométrica': 'Barra de Cardio',
  'elliptical': 'Barra de Cardio',
  'eliptico': 'Barra de Cardio',
  'elíptico': 'Barra de Cardio',
  'rower': 'Barra de Cardio',
  'remo': 'Barra de Cardio',
  'stair': 'Barra de Cardio',
  'escada': 'Barra de Cardio',
  'rope': 'Barra de Cardio',
  'corda': 'Barra de Cardio',
  'ball': 'Equipamento de Esportes',
  'bola': 'Equipamento de Esportes',
  'racket': 'Equipamento de Esportes',
  'raquete': 'Equipamento de Esportes',
  'gloves': 'Equipamento de Esportes',
  'luvas': 'Equipamento de Esportes',
  'net': 'Equipamento de Esportes',
  'rede': 'Equipamento de Esportes',
  'goal': 'Equipamento de Esportes',
  'gol': 'Equipamento de Esportes',
  'hoop': 'Equipamento de Esportes',
  'cesta': 'Equipamento de Esportes'
};

// Exercise categorization map for precise category mapping
export const EXERCISE_CATEGORY_MAP: Record<string, string> = {
  'corrida': 'Cardio',
  'correr': 'Cardio',
  'esteira': 'Cardio',
  'ciclismo': 'Cardio',
  'bicicleta': 'Cardio',
  'bike': 'Cardio',
  'remo': 'Cardio',
  'pular corda': 'Cardio',
  'jump rope': 'Cardio',
  'jumping': 'Cardio',
  'elíptico': 'Cardio',
  'eliptico': 'Cardio',
  'elliptical': 'Cardio',
  'spinning': 'Cardio',
  'caminhada': 'Cardio',
  'walk': 'Cardio',
  'marcha': 'Cardio',
  'cardio': 'Cardio',
  'aeróbico': 'Cardio',
  'aerobico': 'Cardio',
  'step': 'Cardio',
  'escada': 'Cardio',
  'burpee': 'Cardio',
  'mountain climber': 'Cardio',
  'escalador': 'Cardio',
  'hiit': 'Cardio',
  'intervalo': 'Cardio',
  'circuit': 'Cardio',
  'circuito': 'Cardio',
  'tabata': 'Cardio',
  
  'futebol': 'Esportes',
  'soccer': 'Esportes',
  'football': 'Esportes',
  'basquete': 'Esportes',
  'basketball': 'Esportes',
  'vôlei': 'Esportes',
  'volei': 'Esportes',
  'volleyball': 'Esportes',
  'tênis': 'Esportes',
  'tenis': 'Esportes',
  'tennis': 'Esportes',
  'natação': 'Esportes',
  'natacao': 'Esportes',
  'swimming': 'Esportes',
  'handball': 'Esportes',
  'handebol': 'Esportes',
  'boxe': 'Esportes',
  'boxing': 'Esportes',
  'luta': 'Esportes',
  'martial': 'Esportes',
  'golf': 'Esportes',
  'golfe': 'Esportes',
  'rugby': 'Esportes',
  'badminton': 'Esportes',
  'squash': 'Esportes',
  'beisebol': 'Esportes',
  'baseball': 'Esportes',
  'esgrima': 'Esportes',
  'fencing': 'Esportes',
  'ginástica': 'Esportes',
  'ginastica': 'Esportes',
  'hockey': 'Esportes',
  'hóquei': 'Esportes',
  'hoquei': 'Esportes',
  'judo': 'Esportes',
  'judô': 'Esportes',
  'karate': 'Esportes',
  'karatê': 'Esportes',
  'polo': 'Esportes',
  'skating': 'Esportes',
  'patinação': 'Esportes',
  'patinacao': 'Esportes',
  'surf': 'Esportes',
  'wrestling': 'Esportes',
  'yoga': 'Esportes',
  'pilates': 'Esportes',
  'taekwondo': 'Esportes',
  'artes marciais': 'Esportes'
};

/**
 * Categorizes an exercise based on its name, existing category, and muscle group
 * @param exerciseName The name of the exercise
 * @param existingCategory The existing category (if any)
 * @param existingMuscleGroup The existing muscle group (if any)
 * @returns The determined category
 */
export const categorizeExercise = (
  exerciseName: string,
  existingCategory?: string | null,
  existingMuscleGroup?: string | null
): string => {
  const normalizedName = (exerciseName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Check for exact matches in the category map
  for (const [keyword, category] of Object.entries(EXERCISE_CATEGORY_MAP)) {
    if (normalizedName.includes(keyword.toLowerCase())) {
      console.log(`Categorized "${exerciseName}" as "${category}" via keyword "${keyword}"`);
      return category;
    }
  }
  
  // Check if existing muscle group is valid and in our known groups
  if (existingMuscleGroup && 
      MUSCLE_GROUPS.includes(existingMuscleGroup) && 
      existingMuscleGroup !== 'Todos' && 
      existingMuscleGroup !== 'Não especificado') {
    return existingMuscleGroup;
  }
  
  // Check existing category against aliases
  if (existingCategory) {
    const normalizedCategory = existingCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [alias, category] of Object.entries(MUSCLE_GROUP_ALIASES)) {
      if (normalizedCategory.includes(alias.toLowerCase())) {
        console.log(`Mapped "${existingCategory}" to "${category}" via alias "${alias}"`);
        return category;
      }
    }
    
    // If we have a category that's in our muscle groups list, use that
    if (MUSCLE_GROUPS.includes(existingCategory) && 
        existingCategory !== 'Todos' && 
        existingCategory !== 'Não especificado') {
      return existingCategory;
    }
  }
  
  // Special handling for Bíceps and Tríceps
  if (normalizedName.includes("curl") || 
      normalizedName.includes("rosca") || 
      normalizedName.includes("bicep") || 
      normalizedName.includes("biceps")) {
    return 'Bíceps';
  }
  
  if (normalizedName.includes("trice") || 
      normalizedName.includes("trícep") || 
      normalizedName.includes("extensão") || 
      normalizedName.includes("extensao") ||
      normalizedName.includes("pushdown") || 
      normalizedName.includes("mergulho")) {
    return 'Tríceps';
  }
  
  // Fallback to the existing category or a default
  return existingMuscleGroup || existingCategory || 'Não especificado';
};
