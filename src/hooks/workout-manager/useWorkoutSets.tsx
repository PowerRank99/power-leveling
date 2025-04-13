
import { useState } from 'react';
import { WorkoutExercise, SetData } from '@/types/workoutTypes';
import { useSetPersistence } from '../workout/useSetPersistence';

/**
 * Hook responsible for managing set operations (add, remove, update, complete)
 */
export const useWorkoutSets = (
  workoutId: string | null, 
  exercises: WorkoutExercise[], 
  setCurrentExerciseIndex: React.Dispatch<React.SetStateAction<number>>,
  routineId: string
) => {
  const { updateSet, addSet, removeSet, isProcessing } = useSetPersistence(workoutId);
  const [processedExercises, setProcessedExercises] = useState<WorkoutExercise[]>(exercises);

  /**
   * Handles adding a new set to an exercise
   */
  const handleAddSet = async (exerciseIndex: number) => {
    if (isProcessing) return;
    console.log(`[useWorkoutSets] Adding set for exercise index ${exerciseIndex}`);
    
    try {
      const currentExercise = exercises[exerciseIndex];
      if (!currentExercise) return;
      
      // Extract the sets array from the current exercise
      const currentSets = currentExercise.sets as SetData[];
      
      // Call the addSet function with proper params - we need to pass SetData[] instead of WorkoutExercise[]
      const result = await addSet(exerciseIndex, currentSets, routineId);
      
      if (result) {
        // Update the exercises array with the new sets
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: result
        };
        
        setProcessedExercises(updatedExercises);
      }
    } catch (error) {
      console.error("[useWorkoutSets] Error in handleAddSet:", error);
    }
  };
  
  /**
   * Handles removing a set from an exercise
   */
  const handleRemoveSet = async (exerciseIndex: number, setIndex: number) => {
    if (isProcessing) return;
    console.log(`[useWorkoutSets] Removing set ${setIndex} from exercise ${exerciseIndex}`);
    
    try {
      const currentExercise = exercises[exerciseIndex];
      if (!currentExercise) return;
      
      // Extract the sets array from the current exercise - cast to SetData[]
      const currentSets = currentExercise.sets as SetData[];
      
      // Call the removeSet function with proper params - pass SetData[] instead of WorkoutExercise[]
      const result = await removeSet(exerciseIndex, currentSets, setIndex, routineId);
      
      if (result) {
        // Update the exercises array with the modified sets
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: result
        };
        
        setProcessedExercises(updatedExercises);
      }
    } catch (error) {
      console.error("[useWorkoutSets] Error in handleRemoveSet:", error);
    }
  };
  
  /**
   * Handles updating a set's data
   */
  const handleUpdateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    if (isProcessing) return;
    
    try {
      const currentExercise = exercises[exerciseIndex];
      if (!currentExercise) return;
      
      // Extract the sets array from the current exercise
      const currentSets = currentExercise.sets as SetData[];
      
      // Call the updateSet function with proper params
      const result = await updateSet(exerciseIndex, currentSets, setIndex, data);
      
      if (result) {
        // Update the exercises array with the modified sets
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: result
        };
        
        setProcessedExercises(updatedExercises);
      }
    } catch (error) {
      console.error("[useWorkoutSets] Error in handleUpdateSet:", error);
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
      
      await handleUpdateSet(exerciseIndex, setIndex, { 
        completed: newCompleted
      });
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
