
import { useState, useEffect } from 'react';
import { useExerciseRestTimer, TimerState, TimerSettings } from '@/hooks/useExerciseRestTimer';
import { WorkoutExercise } from '@/types/workoutTypes';
import { TimerService } from '@/services/timer/TimerService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

/**
 * Custom hook to manage workout timer controls in a centralized way
 */
export const useWorkoutTimerController = (exercises: WorkoutExercise[]) => {
  const { user } = useAuth();
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
  const [isSavingTimer, setIsSavingTimer] = useState<Record<string, boolean>>({});
  
  // Handle timer click for an exercise
  const handleTimerClick = (exerciseId: string, exerciseName: string) => {
    setSelectedExerciseId(exerciseId);
    setSelectedExerciseName(exerciseName);
    setShowDurationSelector(true);
  };
  
  // Handle timer duration selection with immediate persistence
  const handleTimerDurationSelect = async (duration: number) => {
    if (!selectedExerciseId || !user) return;
    
    try {
      // Update local state immediately for responsive UI
      setExerciseTimers(prev => ({
        ...prev,
        [selectedExerciseId]: duration
      }));

      // Mark this exercise as having a saving in progress
      setIsSavingTimer(prev => ({
        ...prev,
        [selectedExerciseId]: true
      }));
      
      // Update in the timer state if it's the current timer
      updateTimerDuration(selectedExerciseId, duration);
      
      // Save to database immediately
      const result = await TimerService.saveExerciseTimerDuration(
        user.id,
        selectedExerciseId,
        duration
      );
      
      if (!result.success) {
        throw new Error("Failed to save timer duration");
      }
      
      console.log(`Timer duration saved for exercise ${selectedExerciseId}: ${duration}s`);
    } catch (error) {
      console.error("Error saving timer duration:", error);
      toast.error("Erro ao salvar duração do timer");
      
      // Revert to previous/default value on error
      handleLoadExerciseTimer(selectedExerciseId);
    } finally {
      // Clear saving state
      setIsSavingTimer(prev => ({
        ...prev,
        [selectedExerciseId]: false
      }));
    }
  };
  
  // Load exercise timer duration
  const handleLoadExerciseTimer = async (exerciseId: string) => {
    if (!user) return;
    
    try {
      setIsSavingTimer(prev => ({
        ...prev,
        [exerciseId]: true
      }));
      
      const result = await TimerService.getExerciseTimerDuration(user.id, exerciseId);
      
      if (result.success && typeof result.data === 'number') {
        setExerciseTimers(prev => ({
          ...prev,
          [exerciseId]: result.data as number
        }));
        
        return result.data;
      }
    } catch (error) {
      console.error(`Error loading timer for ${exerciseId}:`, error);
    } finally {
      setIsSavingTimer(prev => ({
        ...prev,
        [exerciseId]: false
      }));
    }
    
    return null;
  };
  
  // Load timer durations for all exercises on mount
  useEffect(() => {
    if (exercises && exercises.length > 0 && user) {
      exercises.forEach(exercise => {
        handleLoadExerciseTimer(exercise.id);
      });
    }
  }, [exercises, user]);

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
    handleTimerDurationSelect,
    handleLoadExerciseTimer,
    getExerciseTimerDuration: (exerciseId: string) => exerciseTimers[exerciseId] || 90
  };
};
