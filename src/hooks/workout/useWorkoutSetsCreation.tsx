
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWorkoutSetsCreation = () => {
  /**
   * Creates workout sets for a newly created workout
   */
  const createWorkoutSets = async (
    workoutId: string, 
    routineExercises: any[]
  ) => {
    if (!workoutId || !routineExercises.length) {
      return false;
    }

    try {
      // First, check if there's a previous workout to copy sets from
      const { data: routineData } = await supabase
        .from('workouts')
        .select('routine_id')
        .eq('id', workoutId)
        .single();
        
      let previousWorkoutData: Record<string, any[]> = {};
      
      if (routineData?.routine_id) {
        try {
          console.log("Looking for previous workouts with routine ID:", routineData.routine_id);
          
          // Get most recent completed workout for this routine
          const { data: previousWorkout, error: prevWorkoutError } = await supabase
            .from('workouts')
            .select('id')
            .eq('routine_id', routineData.routine_id)
            .not('id', 'eq', workoutId) 
            .not('completed_at', 'is', null) // Fixed syntax: use .not() with 'is' and null
            .order('completed_at', { ascending: false })
            .limit(1);
          
          if (prevWorkoutError) {
            console.error("Error fetching previous workout:", prevWorkoutError);
          }
          
          if (previousWorkout && previousWorkout.length > 0) {
            console.log("Found previous workout:", previousWorkout[0].id);
            
            // Get all completed sets from the previous workout
            const { data: previousSets, error: prevSetsError } = await supabase
              .from('workout_sets')
              .select('exercise_id, weight, reps, set_order')
              .eq('workout_id', previousWorkout[0].id);
            
            if (prevSetsError) {
              console.error("Error fetching previous sets:", prevSetsError);
            }
            
            if (previousSets && previousSets.length > 0) {
              console.log("Found previous sets:", previousSets.length);
              
              // Group by exercise ID
              previousWorkoutData = previousSets.reduce((acc: Record<string, any[]>, curr) => {
                if (!curr.exercise_id) return acc;
                if (!acc[curr.exercise_id]) acc[curr.exercise_id] = [];
                acc[curr.exercise_id].push({
                  weight: curr.weight,
                  reps: curr.reps,
                  set_order: curr.set_order
                });
                return acc;
              }, {});
            }
          } else {
            console.log("No previous completed workouts found for this routine");
          }
        } catch (error) {
          console.error("Error fetching previous workout data:", error);
        }
      }

      const workoutSetsToInsert = [];
      
      // Format exercises data for UI and prepare sets
      for (let i = 0; i < routineExercises.length; i++) {
        const routineExercise = routineExercises[i];
        const exerciseId = routineExercise.exercises.id;
        
        // Check if we have previous data for this exercise
        const previousSetData = previousWorkoutData[exerciseId] || [];
        
        // Use either previous set count or target sets (default to 3 if neither exists)
        const targetSets = previousSetData.length > 0 ? previousSetData.length : 
                          (routineExercise.target_sets || 3);
        
        console.log(`Exercise ${exerciseId} (${routineExercise.exercises.name}): Creating ${targetSets} sets (${previousSetData.length} found in previous workout)`);
        
        // Parse target reps properly
        const targetRepsString = routineExercise.target_reps || '12';
        const targetReps = targetRepsString.includes(',') ? 
          targetRepsString.split(',') : 
          [targetRepsString];
        
        // Create sets
        for (let setIndex = 0; setIndex < targetSets; setIndex++) {
          const repTarget = setIndex < targetReps.length ? targetReps[setIndex] : targetReps[targetReps.length - 1];
          
          // Try to find a matching previous set
          const previousMatchingSet = previousSetData.find(set => set.set_order === setIndex) || 
                                     previousSetData[setIndex];
          
          const weight = previousMatchingSet?.weight || 0;
          const reps = previousMatchingSet?.reps || parseInt(repTarget) || 0;
          
          workoutSetsToInsert.push({
            workout_id: workoutId,
            exercise_id: exerciseId,
            set_order: setIndex, // Simplified set_order to just be the index
            reps: reps,
            weight: weight,
            completed: false
          });
        }
      }
      
      if (workoutSetsToInsert.length > 0) {
        console.log("Creating workout sets:", workoutSetsToInsert.length);
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(workoutSetsToInsert);
          
        if (setsError) {
          console.error("Error creating workout sets:", setsError);
          toast.error("Erro ao criar séries", {
            description: "Algumas séries podem não ter sido criadas."
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error creating workout sets:", error);
      return false;
    }
  };

  return {
    createWorkoutSets
  };
};
