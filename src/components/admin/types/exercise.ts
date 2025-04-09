
export interface AdminExercise {
  id: string;
  name: string;
  category: string;
  level: string;
  type: string;
  image_url?: string;
  description?: string;
  equipment?: string;
  muscle_group?: string;
  equipment_type?: string;
}

export interface ExerciseFilterState {
  searchQuery: string;
  muscleFilter: string;
  equipmentFilter: string;
}
