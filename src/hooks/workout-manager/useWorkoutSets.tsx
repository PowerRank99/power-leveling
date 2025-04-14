
import { useState } from 'react';
import { WorkoutExercise, SetData, WorkoutSet } from '@/types/workout';
import { useSetPersistence } from '../workout/useSetPersistence';
import { mapSetDataToWorkoutSet } from '@/utils/typeMappers';

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
      
      // Extract the sets array from the current exercise and convert to SetData
      const currentSets = currentExercise.sets.map(set => ({
        id: set.id,
        exercise_id: set.exercise_id || currentExercise.exerciseId,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
        set_order: set.set_order || 0,
        previous: set.previous
      })) as SetData[];
      
      // Call the addSet function with proper params
      const result = await addSet(exerciseIndex, currentSets, routineId);
      
      if (result) {
        // Convert back to WorkoutSet type for compatibility
        const workoutSets = result.map(setData => mapSetDataToWorkoutSet(setData));
        
        // Update the exercises array with the new sets
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: workoutSets
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
      
      // Convert to SetData for the operation
      const currentSets = currentExercise.sets.map(set => ({
        id: set.id,
        exercise_id: set.exercise_id || currentExercise.exerciseId,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
        set_order: set.set_order || 0,
        previous: set.previous
      })) as SetData[];
      
      // Call the removeSet function with proper params
      const result = await removeSet(exerciseIndex, currentSets, setIndex, routineId);
      
      if (result) {
        // Convert back to WorkoutSet for compatibility
        const workoutSets = result.map(setData => mapSetDataToWorkoutSet(setData));
        
        // Update the exercises array with the modified sets
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: workoutSets
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
      
      // Convert to SetData for the operation
      const currentSets = currentExercise.sets.map(set => ({
        id: set.id,
        exercise_id: set.exercise_id || currentExercise.exerciseId,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
        set_order: set.set_order || 0,
        previous: set.previous
      })) as SetData[];
      
      // Call the updateSet function with proper params
      const result = await updateSet(exerciseIndex, currentSets, setIndex, data);
      
      if (result) {
        // Convert back to WorkoutSet for compatibility
        const workoutSets = result.map(setData => mapSetDataToWorkoutSet(setData));
        
        // Update the exercises array with the modified sets
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: workoutSets
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
