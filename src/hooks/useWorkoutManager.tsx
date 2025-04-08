
import { useState, useCallback, useEffect } from 'react';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutInitialization } from './workout/useWorkoutInitialization';
import { useWorkoutSetManagement } from './workout/useWorkoutSetManagement';
import { useWorkoutActions } from './workout/useWorkoutActions';
import { useWorkoutNotesManager } from './workout/useWorkoutNotesManager';

/**
 * A comprehensive hook that coordinates all workout operations by composing specialized hooks
 */
export const useWorkoutManager = (routineId: string) => {
  const navigate = useNavigate();

  // Use specialized hooks for different concerns
  const { elapsedTime, formatTime } = useWorkoutTimer();
  
  const { 
    isLoading, 
    loadError, 
    exercises, 
    workoutId, 
    isInitialized,
    setupWorkout,
    setExercises
  } = useWorkoutInitialization(routineId);
  
  const {
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    currentExerciseIndex,
    setCurrentExerciseIndex
  } = useWorkoutSetManagement(workoutId, exercises, setExercises, routineId);

  const {
    finishWorkout,
    discardWorkout,
    isSubmitting
  } = useWorkoutActions(workoutId, elapsedTime, navigate);

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
    notes,
    workoutId
  };
};
