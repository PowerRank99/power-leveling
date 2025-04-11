
export type ExerciseType = 'Força' | 'Cardio' | 'Flexibilidade' | 'Equilíbrio';

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
