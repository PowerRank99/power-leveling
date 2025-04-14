
import { useState, useEffect } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useSetAdder } from './useAddSet';
import { useRemoveSet } from './useRemoveSet';
import { useUpdateSet } from './useUpdateSet';

export const useWorkoutSetsManagement = (
  workoutId: string | null,
  initialExercises: WorkoutExercise[],
  currentExerciseIndex: number
) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises);
  
  // Update local state when props change
  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);
  
  const { updateSet: updateSetInDb } = useUpdateSet(workoutId);
  const { addSet: addSetInDb } = useSetAdder(workoutId);
  const { removeSet: removeSetInDb } = useRemoveSet(workoutId);
  
  const updateSet = async (
    exerciseIndex: number,
    setIndex: number,
    data: { weight?: string; reps?: string; completed?: boolean }
  ) => {
    try {
      console.log(`Updating set ${setIndex} for exercise index ${exerciseIndex} with data:`, data);
      const result = await updateSetInDb(exerciseIndex, exercises, setIndex, data);
      if (result) {
        setExercises(result);
        console.log("Local state updated after set update");
        return result;
      }
      return null;
    } catch (error) {
      console.error("Error in updateSet:", error);
      return null;
    }
  };
  
  const addSet = async (exerciseIndex: number, routineId: string) => {
    try {
      console.log(`Adding set for exercise index ${exerciseIndex}`);
      const result = await addSetInDb(exerciseIndex, exercises, routineId);
      if (result) {
        setExercises(result);
        console.log("Local state updated after set add");
        // Verify the sets in the updated state
        const exerciseSets = result[exerciseIndex].sets;
        console.log(`Updated exercise now has ${exerciseSets.length} sets with IDs:`, 
                    exerciseSets.map(s => s.id));
        return result;
      }
      return null;
    } catch (error) {
      console.error("Error in addSet:", error);
      return null;
    }
  };
  
  const removeSet = async (
    exerciseIndex: number,
    setIndex: number,
    routineId: string
  ) => {
    try {
      console.log(`Removing set ${setIndex} for exercise index ${exerciseIndex}`);
      const result = await removeSetInDb(exerciseIndex, exercises, setIndex, routineId);
      if (result) {
        setExercises(result);
        console.log("Local state updated after set remove");
        return result;
      }
      return null;
    } catch (error) {
      console.error("Error in removeSet:", error);
      return null;
    }
  };

  return {
    exercises,
    updateSet,
    addSet,
    removeSet
  };
};
