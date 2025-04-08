
import { useState, useCallback, useEffect } from 'react';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSetup } from './workout-manager/useWorkoutSetup';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutSets } from './workout-manager/useWorkoutSets';
import { useWorkoutCompletion } from './workout-manager/useWorkoutCompletion';
import { useWorkoutNotes } from './workout-manager/useWorkoutNotes';

/**
 * A comprehensive hook that coordinates all workout operations by composing specialized hooks
 */
export const useWorkoutManager = (routineId: string) => {
  const navigate = useNavigate();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Use specialized hooks for different concerns
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { 
    isLoading, 
    loadError, 
    exercises, 
    workoutId, 
    isInitialized 
  } = useWorkoutSetup(routineId, navigate);

  const {
    handleAddSet,
    handleRemoveSet,
    handleUpdateSet,
    handleCompleteSet,
    isProcessing
  } = useWorkoutSets(workoutId, exercises, setCurrentExerciseIndex);

  const {
    finishWorkout,
    discardWorkout,
    isSubmitting
  } = useWorkoutCompletion(workoutId, elapsedTime, navigate);

  const {
    handleNotesChange
  } = useWorkoutNotes(setNotes);

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
