
import { useState } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useSetManagement } from './useSetManagement';
import { toast } from 'sonner';

/**
 * A hook that provides workout-specific set operations using the composition pattern
 */
export const useWorkoutSetOperations = (
  workoutId: string | null,
  exercises: WorkoutExercise[],
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>,
  routineId: string
) => {
  const { updateSet, addSet, removeSet, isProcessing } = useSetManagement(workoutId);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  /**
   * Updates a set with new values
   */
  const handleUpdateSet = async (
    exerciseIndex: number,
    setIndex: number,
    data: { weight?: string; reps?: string; completed?: boolean }
  ) => {
    if (!exercises[exerciseIndex]) {
      console.error(`Exercise not found at index ${exerciseIndex}`);
      return false;
    }
    
    try {
      console.log(`Updating set ${setIndex} for exercise index ${exerciseIndex} with:`, data);
      
      const result = await updateSet(exerciseIndex, exercises, setIndex, data);
      if (result) {
        setExercises(result);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in handleUpdateSet:", error);
      return false;
    }
  };
  
  /**
   * Adds a new set to an exercise
   */
  const handleAddSet = async (exerciseIndex: number) => {
    try {
      console.log(`Adding new set for exercise index ${exerciseIndex}`);
      
      const result = await addSet(exerciseIndex, exercises, routineId);
      if (result) {
        setExercises(result);
        return true;
      } else {
        console.error("Failed to add set, no result returned");
        return false;
      }
    } catch (error) {
      console.error("Error in handleAddSet:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar uma nova série"
      });
      return false;
    }
  };
  
  /**
   * Removes a set from an exercise
   */
  const handleRemoveSet = async (exerciseIndex: number, setIndex: number) => {
    try {
      console.log(`Removing set ${setIndex} from exercise index ${exerciseIndex}`);
      
      const result = await removeSet(exerciseIndex, exercises, setIndex, routineId);
      if (result) {
        setExercises(result);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in handleRemoveSet:", error);
      return false;
    }
  };
  
  /**
   * Marks a set as completed or not completed
   */
  const handleCompleteSet = async (exerciseIndex: number, setIndex: number) => {
    const currentExercise = exercises[exerciseIndex];
    if (!currentExercise) return false;
    
    const currentSet = currentExercise.sets[setIndex];
    if (!currentSet) return false;
    
    const newCompleted = !currentSet.completed;
    
    console.log(`Marking set ${setIndex} for exercise ${exerciseIndex} as completed=${newCompleted}`);
    
    return handleUpdateSet(exerciseIndex, setIndex, { completed: newCompleted });
  };

  return {
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    isProcessing
  };
};
