
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';

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

    console.log(`Found ${workoutSets?.length || 0} sets for this workout`);
    
    // Log all sets for debug purposes
    if (workoutSets && workoutSets.length > 0) {
      console.log("Workout sets by exercise:");
      const setsByExercise = workoutSets.reduce((acc: Record<string, any[]>, set) => {
        if (!set.exercise_id) return acc;
        if (!acc[set.exercise_id]) acc[set.exercise_id] = [];
        acc[set.exercise_id].push(set);
        return acc;
      }, {});
      
      Object.entries(setsByExercise).forEach(([exerciseId, sets]) => {
        console.log(`Exercise ${exerciseId}: ${sets.length} sets`);
        console.log(`Set orders: ${sets.map(s => s.set_order).join(', ')}`);
        console.log(`Set IDs: ${sets.map(s => s.id).join(', ')}`);
      });
    } else {
      console.warn("No sets found for this workout!");
    }

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
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(1);
        
        if (previousWorkout && previousWorkout.length > 0) {
          console.log("Found previous workout for reference:", previousWorkout[0].id);
          
          // Get all completed sets from the previous workout
          const { data: previousSets } = await supabase
            .from('workout_sets')
            .select('exercise_id, weight, reps, set_order')
            .eq('workout_id', previousWorkout[0].id)
            .order('set_order');
          
          if (previousSets && previousSets.length > 0) {
            console.log(`Found ${previousSets.length} sets from previous workout`);
            
            // Group by exercise ID
            previousWorkoutData = previousSets.reduce((acc: Record<string, any[]>, curr) => {
              if (!curr.exercise_id) return acc;
              if (!acc[curr.exercise_id]) acc[curr.exercise_id] = [];
              
              // Ensure values are always strings for UI consistency
              const weightStr = curr.weight !== null && curr.weight !== undefined ? curr.weight.toString() : '0';
              const repsStr = curr.reps !== null && curr.reps !== undefined ? curr.reps.toString() : '12';
              
              acc[curr.exercise_id].push({
                weight: weightStr,
                reps: repsStr,
                set_order: curr.set_order
              });
              return acc;
            }, {});
            
            // Sort sets by set_order for each exercise
            Object.keys(previousWorkoutData).forEach(exerciseId => {
              previousWorkoutData[exerciseId].sort((a, b) => a.set_order - b.set_order);
            });
            
            console.log("Previous workout data loaded:", Object.keys(previousWorkoutData).length, "exercises");
          }
        }
      } catch (error) {
        console.error("Error fetching previous workout data:", error);
      }
    }

    // Format exercises data for UI with the actual saved sets
    const workoutExercises: WorkoutExercise[] = routineExercises.map((routineExercise, exerciseIndex) => {
      const exercise = routineExercise.exercises;
      
      // Filter sets for this exercise and sort them properly
      const exerciseSets = workoutSets
        ?.filter(set => set.exercise_id === exercise.id)
        .sort((a, b) => a.set_order - b.set_order) || [];
      
      console.log(`Exercise ${exercise.name} has ${exerciseSets.length} sets with IDs: ${exerciseSets.map(s => s.id).join(', ')}`);
      
      // Get previous workout data for this exercise
      const previousExerciseData = previousWorkoutData[exercise.id] || [];
      console.log(`Exercise ${exercise.name} has ${previousExerciseData.length} previous sets`);
      
      // Format sets
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
      
      // If we have no sets, create default ones using previous workout data if available
      if (sets.length === 0) {
        const setCount = Math.max(
          previousExerciseData.length > 0 ? previousExerciseData.length : 0,
          routineExercise.target_sets || 3
        );
        
        console.log(`Creating ${setCount} default sets for ${exercise.name} using previous data`);
        
        sets = Array.from({ length: setCount }).map((_, idx) => {
          const prevSet = previousExerciseData[idx] || { weight: '0', reps: '12' };
          const setOrder = idx; // Simple consistent ordering
          
          console.log(`Default set ${idx} (order ${setOrder}) for ${exercise.name}: using previous [w: ${prevSet.weight}, r: ${prevSet.reps}]`);
          
          return {
            id: `default-${exercise.id}-${idx}`,
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
