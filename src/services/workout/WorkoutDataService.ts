
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { WorkoutExerciseData } from '@/types/workout/WorkoutExerciseData';
import { toast } from 'sonner';
import { WorkoutDataFormatter } from './WorkoutDataFormatter';

/**
 * Service responsible for workout data management
 */
export class WorkoutDataService {
  /**
   * Gets a workout along with its exercises and sets
   */
  static async getWorkoutWithExercises(
    workoutId: string
  ): Promise<WorkoutExercise[]> {
    try {
      console.log(`[WorkoutDataService] Getting workout with ID: ${workoutId}`);
      
      // Get the workout's routine exercises
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('routine_id')
        .eq('id', workoutId)
        .single();
        
      if (workoutError) {
        console.error("[WorkoutDataService] Error fetching workout:", workoutError);
        return [];
      }
      
      const routineId = workoutData.routine_id;
      if (!routineId) {
        console.error("[WorkoutDataService] Workout has no routine_id");
        return [];
      }
      
      // Get routine exercises
      const { data: routineExercises, error: routineError } = await supabase
        .from('routine_exercises')
        .select(`
          id,
          exercise_id,
          target_sets,
          display_order,
          exercises:exercise_id (
            id,
            name,
            type
          )
        `)
        .eq('routine_id', routineId)
        .order('display_order');
        
      if (routineError) {
        console.error("[WorkoutDataService] Error fetching routine exercises:", routineError);
        return [];
      }
      
      // Get all sets for this workout
      const { data: workoutSets, error: setsError } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('workout_id', workoutId)
        .order('set_order');
        
      if (setsError) {
        console.error("[WorkoutDataService] Error fetching workout sets:", setsError);
      }
      
      // Query previous workout data for this routine
      const previousWorkoutData = await this.getPreviousWorkoutData(routineId);
      
      // Format the data using the formatter
      const exercises = await WorkoutDataFormatter.formatWorkoutExercises(
        routineExercises,
        workoutSets,
        previousWorkoutData
      );
      
      // Accessing individual items from an array, not the array itself
      if (routineExercises && routineExercises.length > 0 && routineExercises[0].exercises) {
        console.log(`Found exercise: ${routineExercises[0].exercises.name}`);
      }
      
      return exercises;
    } catch (error) {
      console.error("[WorkoutDataService] Error in getWorkoutWithExercises:", error);
      toast.error("Erro ao carregar o treino", {
        description: "Não foi possível carregar os exercícios do treino"
      });
      return [];
    }
  }
  
  /**
   * Gets previous workout data for a routine
   */
  static async getPreviousWorkoutData(
    routineId: string
  ): Promise<Record<string, any[]>> {
    try {
      console.log(`[WorkoutDataService] Getting previous workout data for routine: ${routineId}`);
      
      // Get the most recent workout for this routine
      const { data: previousWorkout, error: previousWorkoutError } = await supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (previousWorkoutError) {
        console.error("[WorkoutDataService] Error fetching previous workout:", previousWorkoutError);
        return {};
      }
      
      if (!previousWorkout) {
        console.log("[WorkoutDataService] No previous workout found for this routine");
        return {};
      }
      
      // Get the sets from the previous workout
      const { data: previousSets, error: previousSetsError } = await supabase
        .from('workout_sets')
        .select('exercise_id, weight, reps, set_order')
        .eq('workout_id', previousWorkout.id);
        
      if (previousSetsError) {
        console.error("[WorkoutDataService] Error fetching previous workout sets:", previousSetsError);
        return {};
      }
      
      // Group the sets by exercise ID
      const groupedSets: Record<string, any[]> = previousSets.reduce((acc, set) => {
        if (!acc[set.exercise_id]) {
          acc[set.exercise_id] = [];
        }
        acc[set.exercise_id].push(set);
        return acc;
      }, {});
      
      console.log(`[WorkoutDataService] Found previous workout data for exercises:`, Object.keys(groupedSets));
      
      return groupedSets;
    } catch (error) {
      console.error("[WorkoutDataService] Error in getPreviousWorkoutData:", error);
      return {};
    }
  }

  /**
   * Format exercise data for the UI
   */
  static formatExerciseData(exerciseData: any[]): WorkoutExerciseData[] {
    if (!exerciseData || !Array.isArray(exerciseData)) {
      console.error('Invalid exercise data received:', exerciseData);
      return [];
    }
    
    try {
      return exerciseData.map(exercise => ({
        id: exercise.id || '',
        exercise_id: exercise.exercise_id || '',
        name: exercise.name || 'Unknown Exercise',
        type: exercise.type || '',
        weight: exercise.weight || 0,
        reps: exercise.reps || 0,
        sets: exercise.sets || 0,
        targetSets: exercise.target_sets
      }));
    } catch (error) {
      console.error('Error formatting exercise data:', error);
      return [];
    }
  }
}
