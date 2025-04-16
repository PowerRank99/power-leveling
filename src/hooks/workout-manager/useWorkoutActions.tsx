
import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { WorkoutCompletionService } from '@/services/workout/WorkoutCompletionService';

/**
 * Hook for managing workout actions (finish/discard)
 */
export const useWorkoutActions = (
  workoutId: string | null,
  elapsedTime: number,
  navigate: NavigateFunction
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Finish the current workout
   */
  const finishWorkout = async () => {
    if (!workoutId) {
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await WorkoutCompletionService.finishWorkout(workoutId, elapsedTime);
      
      if (result) {
        // Redirect to workout page after a delay
        setTimeout(() => {
          navigate('/treino');
        }, 1500);
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Discard the current workout
   */
  const discardWorkout = async () => {
    if (!workoutId) {
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await WorkoutCompletionService.discardWorkout(workoutId);
      
      if (result) {
        // Redirect to workout page immediately
        navigate('/treino');
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
