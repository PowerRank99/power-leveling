
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';

export const useFetchWorkoutSets = () => {
  /**
   * Fetches all workout sets for a workout and formats them for UI
   */
  const fetchWorkoutSetData = async (workoutId: string, routineExercises: any[]) => {
    if (!workoutId || !routineExercises.length) {
      return null;
    }

    // Fetch all workout sets for this workout
    const { data: workoutSets, error: fetchSetsError } = await supabase
      .from('workout_sets')
      .select(`
        id,
        exercise_id,
        set_order,
        weight,
        reps,
        completed
      `)
      .eq('workout_id', workoutId)
      .order('set_order');
      
    if (fetchSetsError) {
      console.error("Error fetching workout sets:", fetchSetsError);
      throw fetchSetsError;
    }

    // Format exercises data for UI with the actual saved sets
    const workoutExercises: WorkoutExercise[] = routineExercises.map(routineExercise => {
      const exercise = routineExercise.exercises;
      
      // Filter sets for this exercise
      const exerciseSets = workoutSets.filter(set => 
        set.exercise_id === exercise.id
      ).sort((a, b) => a.set_order - b.set_order);
      
      // Format sets
      const sets = exerciseSets.map(set => ({
        id: set.id,
        weight: set.weight.toString(),
        reps: set.reps.toString(),
        completed: set.completed,
        previous: {
          weight: set.weight.toString(),
          reps: set.reps.toString()
        }
      }));
      
      return {
        id: exercise.id,
        name: exercise.name,
        sets: sets.length > 0 ? sets : [{
          id: `default-${exercise.id}`,
          weight: '0',
          reps: '12',
          completed: false,
          previous: { weight: '0', reps: '12' }
        }]
      };
    });

    return workoutExercises;
  };

  return {
    fetchWorkoutSetData
  };
};
