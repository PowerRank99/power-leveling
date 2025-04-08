
import { WorkoutExercise } from '@/types/workout';
import { SetService } from '@/services/SetService';

/**
 * Service responsible for formatting workout data for the UI
 */
export class WorkoutDataFormatter {
  /**
   * Formats workout data for the UI with appropriate sets
   */
  static formatWorkoutExercises(
    routineExercises: any[],
    workoutSets: any[],
    previousWorkoutData: Record<string, any[]>
  ): WorkoutExercise[] {
    // Format exercises data for UI with the actual saved sets
    const workoutExercises: WorkoutExercise[] = routineExercises.map((routineExercise) => {
      const exercise = routineExercise.exercises;
      const targetSetCount = routineExercise.target_sets || 3;
      
      console.log(`Processing ${exercise.name} with target set count: ${targetSetCount}`);
      
      // Filter sets for this exercise and sort them properly
      const exerciseSets = workoutSets
        ?.filter(set => set.exercise_id === exercise.id)
        .sort((a, b) => a.set_order - b.set_order) || [];
      
      console.log(`Exercise ${exercise.name} has ${exerciseSets.length} sets with IDs: ${exerciseSets.map(s => s.id).join(', ')}`);
      console.log(`Target set count from routine_exercises: ${targetSetCount}`);
      
      // Get previous workout data for this exercise
      const previousExerciseData = previousWorkoutData[exercise.id] || [];
      console.log(`Exercise ${exercise.name} has ${previousExerciseData.length} previous sets`);
      
      // Format sets from the database (these are the real sets that exist)
      let sets = exerciseSets.map((set, index) => {
        // Find matching set from previous workout by set_order or index
        const previousSet = previousExerciseData.find(p => p.set_order === set.set_order) || 
                          previousExerciseData[index] ||
                          { weight: '0', reps: '12' };
        
        // Ensure weight and reps are always strings for UI consistency
        const weight = set.weight !== null && set.weight !== undefined ? set.weight.toString() : '0';
        const reps = set.reps !== null && set.reps !== undefined ? set.reps.toString() : '12';
        
        console.log(`Set ${index} (ID: ${set.id}, order ${set.set_order}) for ${exercise.name}: current [w: ${weight}, r: ${reps}], previous [w: ${previousSet.weight}, r: ${previousSet.reps}]`);
        
        return {
          id: set.id,
          weight: weight,
          reps: reps,
          completed: set.completed || false,
          set_order: set.set_order, // Include set_order for reference
          previous: {
            weight: previousSet.weight || '0',
            reps: previousSet.reps || '12'
          }
        };
      });
      
      // IMPORTANT: The source of truth is the database
      // If we have fewer sets in DB than target_sets, create default placeholders
      const actualSetCount = exerciseSets.length;
      
      // Add default sets only if we have fewer database sets than the target
      if (actualSetCount < targetSetCount) {
        const setsToAdd = targetSetCount - actualSetCount;
        
        console.log(`Creating ${setsToAdd} default sets for ${exercise.name} to reach target of ${targetSetCount}`);
        
        const defaultSets = Array.from({ length: setsToAdd }).map((_, idx) => {
          const setIndex = sets.length + idx;
          const prevSet = previousExerciseData[setIndex] || { weight: '0', reps: '12' };
          const setOrder = setIndex; // Simple consistent ordering
          
          console.log(`Default set ${setIndex} (order ${setOrder}) for ${exercise.name}: using previous [w: ${prevSet.weight}, r: ${prevSet.reps}]`);
          
          return {
            id: `default-${exercise.id}-${setIndex}`,
            weight: prevSet.weight || '0',
            reps: prevSet.reps || '12',
            completed: false,
            set_order: setOrder,
            previous: { 
              weight: prevSet.weight || '0', 
              reps: prevSet.reps || '12' 
            }
          };
        });
        
        // Append these default sets to any existing database sets
        sets = [...sets, ...defaultSets];
        console.log(`Final set count for ${exercise.name}: ${sets.length} (${actualSetCount} from DB + ${setsToAdd} defaults)`);
      }
      
      return {
        id: exercise.id,
        name: exercise.name,
        sets
      };
    });

    return workoutExercises;
  }
}
