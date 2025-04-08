
import { useState } from 'react';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useSetPersistence } from '../workout/useSetPersistence';

/**
 * Hook responsible for managing set operations (add, remove, update, complete)
 */
export const useWorkoutSets = (
  workoutId: string | null, 
  exercises: WorkoutExercise[], 
  setCurrentExerciseIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  const { updateSet, addSet, removeSet, isProcessing } = useSetPersistence(workoutId);
  const [processedExercises, setProcessedExercises] = useState<WorkoutExercise[]>(exercises);

  /**
   * Handles adding a new set to an exercise
   */
  const handleAddSet = async (exerciseIndex: number) => {
    if (isProcessing) return;
    console.log(`[useWorkoutSets] Adding set for exercise index ${exerciseIndex}`);
    
    const result = await addSet(exerciseIndex, exercises, '');
    if (result) {
      setProcessedExercises(result);
    }
  };
  
  /**
   * Handles removing a set from an exercise
   */
  const handleRemoveSet = async (exerciseIndex: number, setIndex: number) => {
    if (isProcessing) return;
    console.log(`[useWorkoutSets] Removing set ${setIndex} from exercise ${exerciseIndex}`);
    
    const result = await removeSet(exerciseIndex, exercises, setIndex, '');
    if (result) {
      setProcessedExercises(result);
    }
  };
  
  /**
   * Handles updating a set's data
   */
  const handleUpdateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string }) => {
    if (isProcessing) return;
    
    const result = await updateSet(exerciseIndex, exercises, setIndex, data);
    if (result) {
      setProcessedExercises(result);
    }
  };
  
  /**
   * Handles marking a set as completed
   */
  const handleCompleteSet = async (exerciseIndex: number, setIndex: number) => {
    if (isProcessing) return;
    
    const currentExercise = exercises[exerciseIndex];
    if (currentExercise) {
      const newCompleted = !currentExercise.sets[setIndex].completed;
      console.log(`[useWorkoutSets] Setting complete=${newCompleted} for exercise ${exerciseIndex}, set ${setIndex}`);
      
      const result = await updateSet(exerciseIndex, exercises, setIndex, { 
        completed: newCompleted
      });
      
      if (result) {
        setProcessedExercises(result);
      }
    }
  };

  return {
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    isProcessing
  };
};
