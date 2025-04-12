
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';

/**
 * Service responsible for reconciling set counts between the database and routine_exercises
 */
export class SetReconciliationService {
  /**
   * Reconciles set counts between workout exercises and routine exercises
   */
  static async reconcileSetCounts(
    routineId: string | null,
    workoutExercises: WorkoutExercise[], 
    routineExercises: any[]
  ): Promise<void> {
    if (!routineId) return;
    
    try {
      console.log("[SetReconciliationService] Reconciling set counts for routine", routineId);
      
      for (let i = 0; i < workoutExercises.length; i++) {
        const workoutExercise = workoutExercises[i];
        const routineExercise = routineExercises.find(
          re => re.exercises.id === workoutExercise.id
        );
        
        if (!routineExercise) continue;
        
        // Count real sets (not placeholders)
        if (!Array.isArray(workoutExercise.sets)) {
          console.log(`[SetReconciliationService] Exercise ${workoutExercise.name} has no sets array`);
          continue;
        }
        
        const realSets = workoutExercise.sets.filter(
          set => !set.id.startsWith('default-') && !set.id.startsWith('new-')
        );
        
        // If the count differs from target_sets, update it
        if (realSets.length !== routineExercise.target_sets) {
          console.log(
            `[SetReconciliationService] Updating target_sets for exercise ${workoutExercise.name}: ` +
            `${routineExercise.target_sets} -> ${realSets.length}`
          );
          
          await supabase
            .from('routine_exercises')
            .update({ target_sets: realSets.length })
            .eq('routine_id', routineId)
            .eq('exercise_id', workoutExercise.id);
        }
      }
    } catch (error) {
      console.error("[SetReconciliationService] Error reconciling set counts:", error);
    }
  }
}
