
export type ExerciseType = 'Musculação' | 'Calistenia' | 'Cardio' | 'Esportes' | 'Flexibilidade & Mobilidade';
export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  level: DifficultyLevel;
  type: ExerciseType;
  image_url?: string;
  description?: string;
  equipment_type?: string;
}
