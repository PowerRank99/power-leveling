
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { SetService } from '@/services/SetService';

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
    
    const setCount = workoutSets?.length || 0;
    console.log(`Found ${setCount} sets for this workout`);
    
    // Verify set counts and normalize orders before proceeding
    for (const routineExercise of routineExercises) {
      const exerciseId = routineExercise.exercises.id;
      await SetService.normalizeSetOrders(workoutId, exerciseId);
      
      const exerciseSets = workoutSets?.filter(set => set.exercise_id === exerciseId) || [];
      console.log(`Exercise ${routineExercise.exercises.name} has ${exerciseSets.length} sets with IDs: ${exerciseSets.map(s => s.id).join(', ')}`);
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
      
      // Use sets from DB as the source of truth
      // If we have sets in the database, use that count, otherwise use target_sets
      const actualSetCount = exerciseSets.length;
      const desiredSetCount = Math.max(actualSetCount, targetSetCount);
      
      console.log(`Exercise ${exercise.name}: actual=${actualSetCount}, target=${targetSetCount}, desired=${desiredSetCount}`);
      
      // If we have no sets or fewer sets than the target_sets, create default ones
      if (sets.length < desiredSetCount) {
        const setsToAdd = desiredSetCount - sets.length;
        
        console.log(`Creating ${setsToAdd} default sets for ${exercise.name} to reach target of ${desiredSetCount}`);
        
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
      } else if (sets.length > targetSetCount) {
        console.log(`Exercise ${exercise.name} has ${sets.length} sets in DB but target is ${targetSetCount}, using actual count from DB`);
      }
      
      return {
        id: exercise.id,
        name: exercise.name,
        sets
      };
    });

    // After processing all exercises, reconcile any discrepancies
    if (routineData?.routine_id) {
      for (const exercise of workoutExercises) {
        const actualSets = exercise.sets.filter(s => !s.id.startsWith('default-') && !s.id.startsWith('new-'));
        const routineExercise = routineExercises.find(re => re.exercises.id === exercise.id);
        
        if (routineExercise && actualSets.length !== routineExercise.target_sets) {
          console.log(`Reconciling count mismatch for ${exercise.name}: actual=${actualSets.length}, target=${routineExercise.target_sets}`);
          
          // Update target_sets in routine_exercises to match actual count
          try {
            await SetService.updateRoutineExerciseSetsCount(
              routineData.routine_id,
              exercise.id,
              actualSets.length
            );
          } catch (error) {
            console.error(`Error reconciling set count for ${exercise.name}:`, error);
          }
        }
      }
    }

    return workoutExercises;
  };

  return {
    fetchWorkoutSetData
  };
};
