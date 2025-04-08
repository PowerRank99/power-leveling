
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

    console.log("Fetching workout sets for workout:", workoutId);
    
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

    console.log(`Found ${workoutSets.length} sets for this workout`);

    // Fetch previous workout data for the same routine to use as reference
    const { data: routineData } = await supabase
      .from('workouts')
      .select('routine_id')
      .eq('id', workoutId)
      .single();

    let previousWorkoutData: Record<string, any[]> = {};
    
    if (routineData?.routine_id) {
      try {
        // Get most recent completed workout for this routine (excluding current one)
        const { data: previousWorkout } = await supabase
          .from('workouts')
          .select('id')
          .eq('routine_id', routineData.routine_id)
          .not('id', 'eq', workoutId) 
          .not('completed_at', 'is', null) // Fixed syntax: use .not() with 'is' and null
          .order('completed_at', { ascending: false })
          .limit(1);
        
        if (previousWorkout && previousWorkout.length > 0) {
          console.log("Found previous workout for reference:", previousWorkout[0].id);
          
          // Get all completed sets from the previous workout
          const { data: previousSets } = await supabase
            .from('workout_sets')
            .select('exercise_id, weight, reps, set_order')
            .eq('workout_id', previousWorkout[0].id);
          
          if (previousSets && previousSets.length > 0) {
            console.log(`Found ${previousSets.length} sets from previous workout`);
            
            // Group by exercise ID
            previousWorkoutData = previousSets.reduce((acc: Record<string, any[]>, curr) => {
              if (!curr.exercise_id) return acc;
              if (!acc[curr.exercise_id]) acc[curr.exercise_id] = [];
              acc[curr.exercise_id].push({
                weight: curr.weight?.toString() || '0',
                reps: curr.reps?.toString() || '0',
                set_order: curr.set_order
              });
              return acc;
            }, {});
          }
        }
      } catch (error) {
        console.error("Error fetching previous workout data:", error);
      }
    }

    // Format exercises data for UI with the actual saved sets
    const workoutExercises: WorkoutExercise[] = routineExercises.map(routineExercise => {
      const exercise = routineExercise.exercises;
      
      // Filter sets for this exercise
      const exerciseSets = workoutSets.filter(set => 
        set.exercise_id === exercise.id
      ).sort((a, b) => a.set_order - b.set_order);
      
      console.log(`Exercise ${exercise.name} has ${exerciseSets.length} sets`);
      
      // Get previous workout data for this exercise
      const previousExerciseData = previousWorkoutData[exercise.id];
      
      // Format sets
      let sets = exerciseSets.map((set, index) => {
        // Get matching set from previous workout if available
        const previousSet = previousExerciseData && previousExerciseData.find(p => p.set_order === set.set_order) || 
                           previousExerciseData && previousExerciseData[index];
        
        return {
          id: set.id,
          weight: set.weight?.toString() || '0',
          reps: set.reps?.toString() || '0',
          completed: set.completed,
          previous: previousSet || {
            weight: '0',
            reps: '0'
          }
        };
      });
      
      // If we have no sets, create default ones using previous workout data if available
      if (sets.length === 0) {
        const setCount = routineExercise.target_sets || 3;
        
        sets = Array.from({ length: setCount }).map((_, idx) => {
          const prevSet = previousExerciseData && previousExerciseData[idx];
          
          return {
            id: `default-${exercise.id}-${idx}`,
            weight: prevSet?.weight || '0',
            reps: prevSet?.reps || '12',
            completed: false,
            previous: { 
              weight: prevSet?.weight || '0', 
              reps: prevSet?.reps || '12' 
            }
          };
        });
      }
      
      return {
        id: exercise.id,
        name: exercise.name,
        sets
      };
    });

    return workoutExercises;
  };

  return {
    fetchWorkoutSetData
  };
};
