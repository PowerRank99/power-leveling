
import { useState, useEffect } from 'react';
import { useExerciseRestTimer } from './useExerciseRestTimer';
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Custom hook to manage workout timer controls in a centralized way
 */
export const useWorkoutTimerController = (exercises: WorkoutExercise[]) => {
  const {
    timerState,
    timerSettings,
    showDurationSelector,
    setShowDurationSelector,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime,
    formatTime,
    loadExerciseTimerDuration,
    updateTimerDuration
  } = useExerciseRestTimer();
  
  // State for timer modal
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [exerciseTimers, setExerciseTimers] = useState<Record<string, number>>({});
  
  // Handle timer click for an exercise
  const handleTimerClick = (exerciseId: string, exerciseName: string) => {
    setSelectedExerciseId(exerciseId);
    setSelectedExerciseName(exerciseName);
    setShowDurationSelector(true);
  };
  
  // Handle timer duration selection
  const handleTimerDurationSelect = (duration: number) => {
    if (selectedExerciseId) {
      // Update the duration in our local state
      setExerciseTimers(prev => ({
        ...prev,
        [selectedExerciseId]: duration
      }));
      
      // Update in the timer state if it's the current timer
      updateTimerDuration(selectedExerciseId, duration);
    }
  };
  
  // Load exercise timer duration
  const handleLoadExerciseTimer = (exerciseId: string) => {
    loadExerciseTimerDuration(exerciseId)
      .then(duration => {
        if (typeof duration === 'number') {
          setExerciseTimers(prev => ({
            ...prev,
            [exerciseId]: duration
          }));
        }
      })
      .catch(error => {
        console.error(`Error loading timer for ${exerciseId}:`, error);
      });
  };
  
  // Load timer durations for all exercises on mount
  useEffect(() => {
    if (exercises && exercises.length > 0) {
      exercises.forEach(exercise => {
        handleLoadExerciseTimer(exercise.id);
      });
    }
  }, [exercises]);

  return {
    timerState,
    timerSettings,
    showDurationSelector,
    setShowDurationSelector,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime,
    formatTime,
    selectedExerciseId,
    selectedExerciseName,
    exerciseTimers,
    handleTimerClick,
    handleTimerDurationSelect,
    handleLoadExerciseTimer,
    getExerciseTimerDuration: (exerciseId: string) => exerciseTimers[exerciseId] || 90
  };
};
