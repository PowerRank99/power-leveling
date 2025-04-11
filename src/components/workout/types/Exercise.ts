
export type ExerciseType = 'Musculação' | 'Calistenia' | 'Cardio' | 'Esportes' | 'Flexibilidade & Mobilidade';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  level: string;
  type: ExerciseType;
  image_url?: string;
  description?: string;
  equipment_type?: string;
}
