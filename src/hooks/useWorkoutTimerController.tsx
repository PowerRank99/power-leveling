
import { useState, useEffect, useCallback } from 'react';
import { useExerciseRestTimer } from './useExerciseRestTimer';
import { WorkoutExercise } from '@/types/workoutTypes';
import { toast } from 'sonner';

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
    updateTimerDuration,
    saveExerciseTimerDuration
  } = useExerciseRestTimer();
  
  // State for timer modal
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [exerciseTimers, setExerciseTimers] = useState<Record<string, number>>({});
  const [savingTimerDuration, setSavingTimerDuration] = useState<Record<string, boolean>>({});
  
  // Handle timer click for an exercise
  const handleTimerClick = (exerciseId: string, exerciseName: string) => {
    setSelectedExerciseId(exerciseId);
    setSelectedExerciseName(exerciseName);
    setShowDurationSelector(true);
  };
  
  // Handle timer duration selection
  const handleTimerDurationSelect = async (duration: number) => {
    if (selectedExerciseId) {
      // Update the duration in our local state
      setExerciseTimers(prev => ({
        ...prev,
        [selectedExerciseId]: duration
      }));
      
      // Update in the timer state if it's the current timer
      updateTimerDuration(selectedExerciseId, duration);
      
      // Save the duration to the database
      try {
        setSavingTimerDuration(prev => ({ ...prev, [selectedExerciseId]: true }));
        await saveExerciseTimerDuration(selectedExerciseId, duration);
        console.log(`Timer duration for ${selectedExerciseId} saved to database: ${duration}s`);
      } catch (error) {
        console.error(`Error saving timer duration for ${selectedExerciseId}:`, error);
        toast.error("Não foi possível salvar o tempo de descanso");
      } finally {
        setSavingTimerDuration(prev => ({ ...prev, [selectedExerciseId]: false }));
      }
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
    savingTimerDuration,
    handleTimerClick,
    handleTimerDurationSelect,
    handleLoadExerciseTimer,
    getExerciseTimerDuration: (exerciseId: string) => exerciseTimers[exerciseId] || 90
  };
};
