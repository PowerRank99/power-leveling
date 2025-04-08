
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
          // Get most recent completed workout for this routine
          const { data: previousWorkout } = await supabase
            .from('workouts')
            .select('id')
            .eq('routine_id', routineData.routine_id)
            .not('id', 'eq', workoutId) 
            .order('completed_at', { ascending: false })
            .limit(1);
          
          if (previousWorkout && previousWorkout.length > 0) {
            // Get all completed sets from the previous workout
            const { data: previousSets } = await supabase
              .from('workout_sets')
              .select('exercise_id, weight, reps, set_order')
              .eq('workout_id', previousWorkout[0].id);
            
            if (previousSets && previousSets.length > 0) {
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
        const targetSets = previousSetData.length || routineExercise.target_sets || 3;
        
        // Parse target reps properly
        const targetRepsString = routineExercise.target_reps || '12';
        const targetReps = targetRepsString.includes(',') ? 
          targetRepsString.split(',') : 
          [targetRepsString];
        
        // Create sets
        for (let setIndex = 0; setIndex < targetSets; setIndex++) {
          const repTarget = setIndex < targetReps.length ? targetReps[setIndex] : targetReps[targetReps.length - 1];
          
          // Try to find a matching previous set
          const previousMatchingSet = previousSetData.find(set => set.set_order === i * 100 + setIndex) || 
                                     previousSetData[setIndex];
          
          workoutSetsToInsert.push({
            workout_id: workoutId,
            exercise_id: exerciseId,
            set_order: i * 100 + setIndex,
            reps: previousMatchingSet?.reps || parseInt(repTarget) || 0,
            weight: previousMatchingSet?.weight || 0,
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
