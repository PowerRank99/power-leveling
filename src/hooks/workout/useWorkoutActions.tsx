
import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { useWorkoutCompletion } from './useWorkoutCompletion';

/**
 * Hook for managing workout actions (finish/discard)
 */
export const useWorkoutActions = (
  workoutId: string | null,
  elapsedTime: number,
  navigate: NavigateFunction
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId, elapsedTime);
  
  const finishWorkout = async () => {
    if (isSubmitting) return false;
    
    try {
      setIsSubmitting(true);
      console.log("Finishing workout with ID:", workoutId);
      
      const success = await finishWorkoutAction();
      
      if (success) {
        // Redirect to workout summary page
        setTimeout(() => {
          navigate('/treino');
        }, 1500);
        
        return true;
      } else {
        throw new Error("Não foi possível finalizar o treino.");
      }
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const discardWorkout = async () => {
    try {
      console.log("Discarding workout with ID:", workoutId);
      
      navigate('/treino');
      return true;
    } catch (error) {
      console.error("Error discarding workout:", error);
      return false;
    }
  };
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
