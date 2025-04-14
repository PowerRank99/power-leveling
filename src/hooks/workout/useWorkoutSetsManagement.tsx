
import { useState, useEffect } from 'react';
import { WorkoutExercise, SetData } from '@/types/workout';
import { useSetAdder } from './useSetAdder';
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
      
      // Extract just the sets from the exercise and convert to SetData
      const currentExercise = exercises[exerciseIndex];
      if (!currentExercise) {
        console.error(`Exercise not found at index ${exerciseIndex}`);
        return null;
      }
      
      // Fixed: Properly map WorkoutExercise sets to SetData
      const exerciseSets = currentExercise.sets.map(set => ({
        id: set.id,
        exercise_id: set.exercise_id || currentExercise.exerciseId,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
        set_order: set.set_order || 0,
        previous: set.previous
      })) as SetData[];
      
      const updatedSets = await updateSetInDb(exerciseIndex, exerciseSets, setIndex, data);
      
      if (updatedSets) {
        // Create a copy of exercises array
        const updatedExercises = [...exercises];
        
        // Get the exercise to update
        const exerciseToUpdate = {...updatedExercises[exerciseIndex]};
        
        // Update the sets of the exercise
        exerciseToUpdate.sets = updatedSets.map(setData => ({
          id: setData.id,
          exercise_id: setData.exercise_id,
          weight: setData.weight,
          reps: setData.reps,
          completed: setData.completed,
          set_order: setData.set_order,
          previous: setData.previous
        }));
        
        // Replace the old exercise with the updated one
        updatedExercises[exerciseIndex] = exerciseToUpdate;
        
        // Update exercises state
        setExercises(updatedExercises);
        console.log("Local state updated after set update");
        return updatedExercises;
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
      
      // Extract the current exercise
      const currentExercise = exercises[exerciseIndex];
      if (!currentExercise) {
        console.error(`Exercise not found at index ${exerciseIndex}`);
        return null;
      }
      
      // Fixed: Properly map WorkoutExercise sets to SetData
      const exerciseSets = currentExercise.sets.map(set => ({
        id: set.id,
        exercise_id: set.exercise_id || currentExercise.exerciseId,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
        set_order: set.set_order || 0,
        previous: set.previous
      })) as SetData[];
      
      const updatedSets = await addSetInDb(exerciseIndex, exerciseSets, routineId);
      
      if (updatedSets) {
        // Create a copy of exercises array
        const updatedExercises = [...exercises];
        
        // Get the exercise to update
        const exerciseToUpdate = {...updatedExercises[exerciseIndex]};
        
        // Update the sets of the exercise
        exerciseToUpdate.sets = updatedSets.map(setData => ({
          id: setData.id,
          exercise_id: setData.exercise_id,
          weight: setData.weight,
          reps: setData.reps,
          completed: setData.completed,
          set_order: setData.set_order,
          previous: setData.previous
        }));
        
        // Replace the old exercise with the updated one
        updatedExercises[exerciseIndex] = exerciseToUpdate;
        
        // Update exercises state
        setExercises(updatedExercises);
        console.log("Local state updated after set add");
        
        // Verify the sets in the updated state
        const verifiedSets = exerciseToUpdate.sets;
        console.log(`Updated exercise now has ${verifiedSets.length} sets with IDs:`, 
                    verifiedSets.map(s => s.id));
                    
        return updatedExercises;
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
      
      // Extract the current exercise
      const currentExercise = exercises[exerciseIndex];
      if (!currentExercise) {
        console.error(`Exercise not found at index ${exerciseIndex}`);
        return null;
      }
      
      // Fixed: Properly map WorkoutExercise sets to SetData
      const exerciseSets = currentExercise.sets.map(set => ({
        id: set.id,
        exercise_id: set.exercise_id || currentExercise.exerciseId,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
        set_order: set.set_order || 0,
        previous: set.previous
      })) as SetData[];
      
      const updatedSets = await removeSetInDb(exerciseIndex, exerciseSets, setIndex, routineId);
      
      if (updatedSets) {
        // Create a copy of exercises array
        const updatedExercises = [...exercises];
        
        // Get the exercise to update
        const exerciseToUpdate = {...updatedExercises[exerciseIndex]};
        
        // Update the sets of the exercise
        exerciseToUpdate.sets = updatedSets.map(setData => ({
          id: setData.id,
          exercise_id: setData.exercise_id,
          weight: setData.weight,
          reps: setData.reps,
          completed: setData.completed,
          set_order: setData.set_order,
          previous: setData.previous
        }));
        
        // Replace the old exercise with the updated one
        updatedExercises[exerciseIndex] = exerciseToUpdate;
        
        // Update exercises state
        setExercises(updatedExercises);
        console.log("Local state updated after set remove");
        return updatedExercises;
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
