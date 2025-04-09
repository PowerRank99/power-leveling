
import { Exercise } from '../../types/Exercise';

export interface UseExerciseSearchProps {
  selectedExercises: Exercise[];
}

export interface ExerciseSearchState {
  searchQuery: string;
  availableExercises: Exercise[];
  filteredExercises: Exercise[];
  isLoading: boolean;
  equipmentFilter: string;
  muscleFilter: string;
  recentExercises: Exercise[];
  debugInfo: {
    totalExercises: number;
    afterEquipmentFilter: number;
    afterMuscleFilter: number;
    finalFiltered: number;
  };
}

export interface ExerciseSearchActions {
  setSearchQuery: (query: string) => void;
  setEquipmentFilter: (filter: string) => void;
  setMuscleFilter: (filter: string) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetFilters: () => void;
}

export interface ExerciseSearchResult extends ExerciseSearchState, ExerciseSearchActions {
  hasActiveFilters: boolean;
}
