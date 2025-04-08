
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutSetUpdate } from './useWorkoutSetUpdate';
import { useWorkoutSetAdd } from './useWorkoutSetAdd';

export const useWorkoutSetsManagement = (
  workoutId: string | null, 
  exercises: WorkoutExercise[], 
  currentExerciseIndex: number
) => {
  const { updateSet } = useWorkoutSetUpdate(workoutId, exercises, currentExerciseIndex);
  const { addSet } = useWorkoutSetAdd(workoutId, exercises, currentExerciseIndex);
  
  return {
    updateSet,
    addSet
  };
};
