
import { WorkoutExercise, WorkoutSet, PreviousSetData } from '@/types/workout';
import { ExerciseHistoryService } from '@/services/ExerciseHistoryService';

/**
 * Service responsible for formatting workout data
 */
export class WorkoutDataFormatter {
  /**
   * Formats workout exercises with appropriate sets
   */
  static async formatWorkoutExercises(
    routineExercises: any[],
    workoutSets: any[] | null,
    previousWorkoutData: Record<string, any[]>
  ): Promise<WorkoutExercise[]> {
    // Extract all exercise IDs for bulk fetching
    const exerciseIds = routineExercises.map(re => re.exercises.id);
    
    // Get exercise history data
    const exerciseHistoryData = await ExerciseHistoryService.getMultipleExerciseHistory(exerciseIds);
    
    // Build exercise data with sets
    const workoutExercisesPromises = routineExercises.map(routineExercise => {
      const exercise = routineExercise.exercises;
      
      // Filter sets for this exercise and sort them
      const exerciseSets = workoutSets
        ?.filter(set => set.exercise_id === exercise.id)
        .sort((a, b) => a.set_order - b.set_order) || [];
      
      console.log(`[WorkoutDataFormatter] Exercise ${exercise.name} has ${exerciseSets.length} sets in database`);
      
      // Get history data for this exercise
      const historyData = exerciseHistoryData[exercise.id];
      
      // Get previous workout data for this exercise
      const previousExerciseData = previousWorkoutData[exercise.id] || [];
      
      // Format sets from database or create defaults
      let sets: WorkoutSet[] = [];
      
      if (exerciseSets.length > 0) {
        // Use existing sets from database
        sets = exerciseSets.map((set, index) => {
          // First try to get values from exercise history
          // Then fallback to previous workout data
          // Finally use defaults if nothing else is available
          
          const previousSet = previousExerciseData.find(p => p.set_order === set.set_order) || 
                            previousExerciseData[index] ||
                            { weight: '0', reps: '12' };
          
          // Create a properly structured PreviousSetData object
          const previousSetData: PreviousSetData = {
            id: set.id || `prev-${exercise.id}-${index}`,
            exercise_id: exercise.id,
            weight: historyData ? historyData.weight.toString() : previousSet.weight.toString(),
            reps: historyData ? historyData.reps.toString() : previousSet.reps.toString(),
            set_order: index
          };
          
          return {
            id: set.id,
            weight: set.weight?.toString() || '0',
            reps: set.reps?.toString() || '0',
            completed: set.completed || false,
            set_order: set.set_order,
            previous: previousSetData,
            exercise_id: exercise.id
          };
        });
      } else {
        // Create default sets using exercise history first, then previous workout data
        const targetSets = Math.max(
          historyData ? historyData.sets : 0,
          previousExerciseData.length > 0 ? previousExerciseData.length : 0,
          routineExercise.target_sets || 3
        );
        
        console.log(`[WorkoutDataFormatter] Creating ${targetSets} default sets for ${exercise.name}`);
        
        sets = Array.from({ length: targetSets }).map((_, index) => {
          // Prioritize exercise history for defaults
          let weight = '0';
          let reps = '12';
          
          if (historyData) {
            weight = historyData.weight.toString();
            reps = historyData.reps.toString();
            console.log(`[WorkoutDataFormatter] Using history for ${exercise.name}: weight=${weight}, reps=${reps}`);
          } else if (previousExerciseData[index]) {
            weight = previousExerciseData[index].weight?.toString() || '0';
            reps = previousExerciseData[index].reps?.toString() || '12';
          }
          
          // Create a properly structured PreviousSetData object
          const previousSetData: PreviousSetData = {
            id: `prev-${exercise.id}-${index}`,
            exercise_id: exercise.id,
            weight,
            reps,
            set_order: index
          };
          
          return {
            id: `default-${exercise.id}-${index}`,
            weight,
            reps,
            completed: false,
            set_order: index,
            previous: previousSetData,
            exercise_id: exercise.id
          };
        });
      }
      
      return {
        id: exercise.id,
        name: exercise.name,
        exerciseId: exercise.id,
        sets
      };
    });
    
    // Wait for all exercise promises to resolve
    return Promise.all(workoutExercisesPromises);
  }

  /**
   * Generate empty sets for an exercise with proper structure
   */
  static generateEmptySets(exerciseId: string, count: number = 3): WorkoutSet[] {
    const sets: WorkoutSet[] = [];
    for (let i = 0; i < count; i++) {
      const id = `new-${Date.now()}-${i}`;
      
      // Create properly structured previous data
      const previousData: PreviousSetData = {
        id,
        exercise_id: exerciseId,
        weight: '0',
        reps: '12',
        set_order: i
      };
      
      sets.push({
        id,
        weight: '0',
        reps: '12',
        completed: false,
        set_order: i,
        previous: previousData,
        exercise_id: exerciseId
      });
    }
    return sets;
  }
}
