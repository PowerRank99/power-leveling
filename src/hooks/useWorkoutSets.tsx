
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutSetsManagement } from './workout/useWorkoutSetsManagement';

export const useWorkoutSets = (
  workoutId: string | null, 
  exercises: WorkoutExercise[], 
  currentExerciseIndex: number
) => {
  return useWorkoutSetsManagement(workoutId, exercises, currentExerciseIndex);
};
