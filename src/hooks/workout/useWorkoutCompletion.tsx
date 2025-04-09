
import { WorkoutCompletionService } from '@/services/workout/WorkoutCompletionService';

/**
 * Hook for workout completion functionality
 */
export const useWorkoutCompletion = (
  workoutId: string | null,
  elapsedTime: number
) => {
  const finishWorkout = async (): Promise<boolean> => {
    if (!workoutId) {
      console.error("No workout ID provided");
      return false;
    }
    
    try {
      return await WorkoutCompletionService.finishWorkout(workoutId, elapsedTime);
    } catch (error) {
      console.error("Error in useWorkoutCompletion:", error);
      return false;
    }
  };
  
  return {
    finishWorkout
  };
};
