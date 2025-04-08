
import { SetService } from '@/services/SetService';
import { WorkoutExercise } from '@/types/workout';

/**
 * Service responsible for reconciling set counts between database and UI
 */
export class SetReconciliationService {
  /**
   * Reconciles any discrepancies in set counts between DB and routine_exercises
   */
  static async reconcileSetCounts(
    routineId: string | null,
    workoutExercises: WorkoutExercise[],
    routineExercises: any[]
  ): Promise<void> {
    if (!routineId) return;
    
    for (const exercise of workoutExercises) {
      // Only count sets with real database IDs (not default or new ones)
      const actualSets = exercise.sets.filter(s => !s.id.startsWith('default-') && !s.id.startsWith('new-'));
      const routineExercise = routineExercises.find(re => re.exercises.id === exercise.id);
      
      if (routineExercise && actualSets.length !== routineExercise.target_sets) {
        console.log(`Reconciling count mismatch for ${exercise.name}: actual=${actualSets.length}, target=${routineExercise.target_sets}`);
        
        // Update target_sets in routine_exercises to match actual count
        try {
          await SetService.updateRoutineExerciseSetsCount(
            routineId,
            exercise.id,
            actualSets.length
          );
        } catch (error) {
          console.error(`Error reconciling set count for ${exercise.name}:`, error);
        }
      }
    }
  }
}
