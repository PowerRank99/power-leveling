
import { useState, useCallback } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useWorkoutVerification } from './workout/useWorkoutVerification';
import { useExistingWorkout } from './workout/useExistingWorkout';
import { useWorkoutCreation } from './workout/useWorkoutCreation';
import { useWorkoutSetsCreation } from './workout/useWorkoutSetsCreation';
import { useFetchRoutineExercises } from './workout/useFetchRoutineExercises';
import { useFetchWorkoutSets } from './workout/useFetchWorkoutSets';

export const useWorkoutExercises = () => {
  const { user } = useAuth();
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  
  // Import all the specialized hooks
  const { verifyRoutineAccess, updateRoutineUsage } = useWorkoutVerification();
  const { findExistingWorkout } = useExistingWorkout();
  const { createNewWorkout } = useWorkoutCreation();
  const { createWorkoutSets } = useWorkoutSetsCreation();
  const { fetchRoutineExerciseData } = useFetchRoutineExercises();
  const { fetchWorkoutSetData } = useFetchWorkoutSets();

  const fetchRoutineExercises = useCallback(async (routineId: string): Promise<{
    workoutExercises: WorkoutExercise[] | null;
    workoutId: string | null;
  }> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (isCreatingWorkout) {
        console.log("Already creating a workout, preventing duplicate creation");
        return { workoutExercises: null, workoutId: null };
      }

      setIsCreatingWorkout(true);
      
      // Step 1: Verify routine access
      await verifyRoutineAccess(routineId, user.id);
      
      // Step 2: Fetch routine exercises FIRST to validate before creating workout
      const routineExercises = await fetchRoutineExerciseData(routineId);
      
      if (!routineExercises || routineExercises.length === 0) {
        throw new Error("Esta rotina não possui exercícios");
      }
      
      // Step 3: Check for existing workouts only after validating exercises
      let workoutId = await findExistingWorkout(routineId, user.id);
      
      // Step 4: Create a new workout if needed
      if (!workoutId) {
        workoutId = await createNewWorkout(routineId, user.id);
        
        // Step 5: Create workout sets for the new workout
        await createWorkoutSets(workoutId, routineExercises);
        
        // Step 6: Update routine's last used timestamp
        await updateRoutineUsage(routineId);
      }

      // Step 7: Fetch and format workout sets data
      const workoutExercises = await fetchWorkoutSetData(workoutId, routineExercises);
      
      return { 
        workoutExercises,
        workoutId
      };
      
    } catch (error: any) {
      console.error("Error setting up workout:", error);
      
      // Use a consistent error ID to prevent duplicate toasts
      toast.error("Erro ao iniciar treino", {
        description: error.message || "Não foi possível iniciar o treino. Tente novamente.",
        id: `workout-setup-error-${routineId}`
      });
      
      return { workoutExercises: null, workoutId: null };
    } finally {
      setIsCreatingWorkout(false);
    }
  }, [
    user,
    isCreatingWorkout,
    verifyRoutineAccess,
    findExistingWorkout,
    createNewWorkout,
    createWorkoutSets,
    updateRoutineUsage,
    fetchRoutineExerciseData,
    fetchWorkoutSetData
  ]);
  
  return {
    fetchRoutineExercises,
    isCreatingWorkout
  };
};
