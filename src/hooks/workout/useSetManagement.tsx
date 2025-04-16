
import { WorkoutExercise } from '@/types/workout';
import { useUpdateSet } from './useUpdateSet';
import { useAddSet } from './useAddSet';
import { useRemoveSet } from './useRemoveSet';

export const useSetManagement = (workoutId: string | null) => {
  const { updateSet } = useUpdateSet(workoutId);
  const { addSet } = useAddSet(workoutId);
  const { removeSet } = useRemoveSet(workoutId);

  return {
    updateSet,
    addSet,
    removeSet
  };
};
