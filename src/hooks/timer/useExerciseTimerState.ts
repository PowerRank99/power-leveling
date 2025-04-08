
import { useState, useEffect } from 'react';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useAuth } from '@/hooks/useAuth';
import { TimerService } from '@/services/timer/TimerService';

/**
 * Hook for managing exercise timer states and durations
 */
export const useExerciseTimerState = (exercises: WorkoutExercise[]) => {
  const { user } = useAuth();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [exerciseTimers, setExerciseTimers] = useState<Record<string, number>>({});
  const [isSavingTimer, setIsSavingTimer] = useState<Record<string, boolean>>({});
  
  // Load timer durations for all exercises on mount
  useEffect(() => {
    if (exercises && exercises.length > 0 && user) {
      exercises.forEach(exercise => {
        handleLoadExerciseTimer(exercise.id);
      });
    }
  }, [exercises, user]);
  
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
  
  const getExerciseTimerDuration = (exerciseId: string) => exerciseTimers[exerciseId] || 90;
  
  return {
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
  };
};
