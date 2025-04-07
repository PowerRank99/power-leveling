
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';

export const useWorkoutSets = (workoutId: string | null, exercises: WorkoutExercise[], currentExerciseIndex: number) => {
  const currentExercise = exercises[currentExerciseIndex];
  
  const updateSet = async (setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    if (!workoutId || !currentExercise) return;
    
    try {
      // Update local state
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[currentExerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data
      };
      
      updatedExercises[currentExerciseIndex].sets = updatedSets;
      
      // Update in database
      const setData: Record<string, any> = {};
      if (data.weight !== undefined) setData.weight = parseFloat(data.weight) || 0;
      if (data.reps !== undefined) setData.reps = parseInt(data.reps) || 0;
      if (data.completed !== undefined) {
        setData.completed = data.completed;
        if (data.completed) {
          setData.completed_at = new Date().toISOString();
        } else {
          setData.completed_at = null;
        }
      }
      
      const { error } = await supabase
        .from('workout_sets')
        .update(setData)
        .eq('workout_id', workoutId)
        .eq('exercise_id', currentExercise.id)
        .eq('set_order', currentExerciseIndex * 100 + setIndex);
        
      if (error) {
        console.error("Error updating set:", error);
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("Error updating set:", error);
      return exercises;
    }
  };
  
  const addSet = async () => {
    if (!workoutId || !currentExercise) return exercises;
    
    try {
      // Add to local state first
      const updatedExercises = [...exercises];
      const lastSet = updatedExercises[currentExerciseIndex].sets[
        updatedExercises[currentExerciseIndex].sets.length - 1
      ];
      
      const newSet = {
        id: `${updatedExercises[currentExerciseIndex].sets.length}`,
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false,
        previous: lastSet.previous
      };
      
      updatedExercises[currentExerciseIndex].sets.push(newSet);
      
      // Add to database
      const newSetOrder = currentExerciseIndex * 100 + updatedExercises[currentExerciseIndex].sets.length - 1;
      
      const { error } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workoutId,
          exercise_id: currentExercise.id,
          set_order: newSetOrder,
          weight: parseFloat(newSet.weight) || 0,
          reps: parseInt(newSet.reps) || 0,
          completed: false
        });
        
      if (error) {
        console.error("Error adding new set:", error);
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("Error adding set:", error);
      return exercises;
    }
  };
  
  return {
    updateSet,
    addSet
  };
};
