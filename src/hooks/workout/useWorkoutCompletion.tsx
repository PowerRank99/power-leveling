
import { useState } from 'react';
import { WorkoutCompletionService } from '@/services/workout/WorkoutCompletionService';

/**
 * Hook for workout completion functionality
 */
export const useWorkoutCompletion = (workoutId: string | null, elapsedTime: number) => {
  const [isCompleting, setIsCompleting] = useState(false);
  
  /**
   * Finish a workout and award XP
   */
  const finishWorkout = async (): Promise<boolean> => {
    if (!workoutId) {
      console.error('No workout ID provided');
      return false;
    }
    
    try {
      setIsCompleting(true);
      console.log('Finishing workout with ID:', workoutId);
      
      // Call workout completion service
      const success = await WorkoutCompletionService.finishWorkout(
        workoutId, 
        elapsedTime
      );
      
      return success;
    } catch (error) {
      console.error('Error in finishWorkout:', error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  };
  
  /**
   * Discard a workout
   */
  const discardWorkout = async (): Promise<boolean> => {
    if (!workoutId) {
      console.error('No workout ID provided');
      return false;
    }
    
    try {
      return await WorkoutCompletionService.discardWorkout(workoutId);
    } catch (error) {
      console.error('Error discarding workout:', error);
      return false;
    }
  };
  
  return {
    finishWorkout,
    discardWorkout,
    isCompleting
  };
};
