
import { useState, useEffect } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutInitialization } from './workout/useWorkoutInitialization';
import { useWorkoutSetManagement } from './workout/useWorkoutSetManagement';
import { useWorkoutActions } from './workout/useWorkoutActions';
import { useWorkoutNotesManager } from './workout/useWorkoutNotesManager';

export type { WorkoutExercise } from '@/types/workout';

/**
 * Main workout hook that orchestrates all workout functionality
 */
export const useWorkout = (routineId: string) => {
  const navigate = useNavigate();
  const { elapsedTime, formatTime } = useWorkoutTimer();
  
  // Use specialized initialization hook
  const { 
    isLoading, 
    loadError, 
    exercises, 
    workoutId, 
    isInitialized,
    setupWorkout,
    setExercises
  } = useWorkoutInitialization(routineId);
  
  // Use specialized set management hook
  const {
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    currentExerciseIndex
  } = useWorkoutSetManagement(workoutId, exercises, setExercises, routineId);
  
  // Use specialized workout completion hook
  const {
    finishWorkout,
    discardWorkout,
    isSubmitting
  } = useWorkoutActions(workoutId, elapsedTime, navigate);
  
  // Use specialized notes management hook
  const {
    notes,
    handleNotesChange
  } = useWorkoutNotesManager();
  
  // Initialize workout when component mounts
  useEffect(() => {
    if (!isInitialized) {
      setupWorkout();
    }
  }, [setupWorkout, isInitialized]);
  
  return {
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises: exercises.length,
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    handleNotesChange,
    finishWorkout,
    discardWorkout,
    elapsedTime,
    formatTime,
    isSubmitting,
    notes
  };
};
