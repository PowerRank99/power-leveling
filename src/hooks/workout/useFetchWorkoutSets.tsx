
import { WorkoutExercise } from '@/types/workout';
import { SetService } from '@/services/SetService';
import { WorkoutSetDataService } from '@/services/workout/WorkoutSetDataService';
import { PreviousWorkoutService } from '@/services/workout/PreviousWorkoutService';
import { WorkoutDataFormatter } from '@/services/workout/WorkoutDataFormatter';
import { SetReconciliationService } from '@/services/workout/SetReconciliationService';

export const useFetchWorkoutSets = () => {
  /**
   * Fetches all workout sets for a workout and formats them for UI
   */
  const fetchWorkoutSetData = async (workoutId: string, routineExercises: any[]) => {
    if (!workoutId || !routineExercises.length) {
      console.error("Missing workoutId or routineExercises in fetchWorkoutSetData");
      return null;
    }

    console.log("Fetching workout sets for workout:", workoutId);
    
    // Log target set counts from routine exercises for debugging
    routineExercises.forEach(re => {
      console.log(`Target sets for ${re.exercises.name} (${re.exercises.id}): ${re.target_sets}`);
    });
    
    // Normalize set orders for all exercises before proceeding
    for (const routineExercise of routineExercises) {
      const exerciseId = routineExercise.exercises.id;
      await SetService.normalizeSetOrders(workoutId, exerciseId);
    }
    
    // Fetch all workout sets for this workout
    const workoutSets = await WorkoutSetDataService.fetchWorkoutSets(workoutId);
    
    // Fetch routine ID for finding previous workouts
    const routineId = await WorkoutSetDataService.fetchWorkoutRoutineId(workoutId);
    
    // Fetch previous workout data for reference values
    const previousWorkoutData = routineId ? 
      await PreviousWorkoutService.fetchPreviousWorkoutData(routineId, workoutId) : {};
    
    // Format workout exercises with appropriate sets - now properly awaiting the Promise
    const workoutExercises = await WorkoutDataFormatter.formatWorkoutExercises(
      routineExercises,
      workoutSets,
      previousWorkoutData
    );

    // Reconcile any discrepancies in set counts between DB and routine_exercises
    await SetReconciliationService.reconcileSetCounts(routineId, workoutExercises, routineExercises);

    return workoutExercises;
  };

  return {
    fetchWorkoutSetData
  };
};
