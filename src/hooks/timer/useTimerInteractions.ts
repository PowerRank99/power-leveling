import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TimerService } from '@/services/timer/TimerService';
import { toast } from 'sonner';

/**
 * Hook for handling timer interactions (click, selection, etc)
 */
export const useTimerInteractions = (
  setSelectedExerciseId: (id: string | null) => void,
  setSelectedExerciseName: (name: string | null) => void,
  setShowDurationSelector: (show: boolean) => void,
  exerciseTimers: Record<string, number>,
  setExerciseTimers: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  setIsSavingTimer: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  updateTimerDuration: (exerciseId: string, duration: number) => void,
  handleLoadExerciseTimer: (exerciseId: string) => Promise<number | null>
) => {
  const { user } = useAuth();

  // Handle timer click for an exercise
  const handleTimerClick = (exerciseId: string, exerciseName: string) => {
    setSelectedExerciseId(exerciseId);
    setSelectedExerciseName(exerciseName);
    setShowDurationSelector(true);
  };
  
  // Handle timer duration selection with immediate persistence
  const handleTimerDurationSelect = async (duration: number) => {
    const exerciseId = selectedExerciseId.current;
    if (!exerciseId || !user) return;
    
    try {
      // Update local state immediately for responsive UI
      setExerciseTimers(prev => ({
        ...prev,
        [exerciseId]: duration
      }));

      // Mark this exercise as having a saving in progress
      setIsSavingTimer(prev => ({
        ...prev,
        [exerciseId]: true
      }));
      
      // Update in the timer state if it's the current timer
      updateTimerDuration(exerciseId, duration);
      
      // Save to database immediately
      const result = await TimerService.saveExerciseTimerDuration(
        user.id,
        exerciseId,
        duration
      );
      
      if (!result.success) {
        throw new Error("Failed to save timer duration");
      }
      
      console.log(`Timer duration saved for exercise ${exerciseId}: ${duration}s`);
    } catch (error) {
      console.error("Error saving timer duration:", error);
      toast.error("Erro ao salvar duração do timer");
      
      // Revert to previous/default value on error
      handleLoadExerciseTimer(exerciseId);
    } finally {
      // Clear saving state
      setIsSavingTimer(prev => ({
        ...prev,
        [exerciseId]: false
      }));
    }
  };

  // Reference to keep track of the currently selected exercise ID
  const selectedExerciseId = { current: null as string | null };

  // Setter that updates both the state and the ref
  const setSelectedExerciseIdWithRef = (id: string | null) => {
    selectedExerciseId.current = id;
    setSelectedExerciseId(id);
  };
  
  return {
    handleTimerClick,
    handleTimerDurationSelect,
    setSelectedExerciseIdWithRef
  };
};
