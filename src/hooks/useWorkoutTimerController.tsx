
import { useState } from 'react';
import { 
  useExerciseRestTimer, 
  TimerState, 
  TimerSettings 
} from '@/hooks/useExerciseRestTimer';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useExerciseTimerState } from './timer/useExerciseTimerState';
import { useTimerInteractions } from './timer/useTimerInteractions';

/**
 * Custom hook to manage workout timer controls in a centralized way
 */
export const useWorkoutTimerController = (exercises: WorkoutExercise[]) => {
  // Timer UI state
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  
  // Initialize the rest timer
  const {
    timerState,
    timerSettings,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime,
    formatTime,
    updateTimerDuration
  } = useExerciseRestTimer();
  
  // Initialize timer state management
  const {
    selectedExerciseId,
    setSelectedExerciseId,
    selectedExerciseName,
    setSelectedExerciseName,
    exerciseTimers,
    setExerciseTimers,
    isSavingTimer,
    setIsSavingTimer,
    handleLoadExerciseTimer,
    getExerciseTimerDuration
  } = useExerciseTimerState(exercises);
  
  // Initialize timer interactions
  const {
    handleTimerClick,
    handleTimerDurationSelect,
    setSelectedExerciseIdWithRef
  } = useTimerInteractions(
    setSelectedExerciseId,
    setSelectedExerciseName,
    setShowDurationSelector,
    exerciseTimers,
    setExerciseTimers,
    setIsSavingTimer,
    updateTimerDuration,
    handleLoadExerciseTimer
  );

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
    isSavingTimer,
    handleTimerClick,
    handleTimerDurationSelect: (duration: number) => {
      // Make sure we're using the wrapper function that updates the ref
      setSelectedExerciseIdWithRef(selectedExerciseId);
      handleTimerDurationSelect(duration);
    },
    handleLoadExerciseTimer,
    getExerciseTimerDuration
  };
};
