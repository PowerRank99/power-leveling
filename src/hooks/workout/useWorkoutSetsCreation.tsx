
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
      const workoutSetsToInsert = [];
      
      // Format exercises data for UI and prepare sets
      for (let i = 0; i < routineExercises.length; i++) {
        const routineExercise = routineExercises[i];
        const targetSets = routineExercise.target_sets || 3;
        
        // Parse target reps properly
        const targetRepsString = routineExercise.target_reps || '12';
        const targetReps = targetRepsString.includes(',') ? 
          targetRepsString.split(',') : 
          [targetRepsString];
        
        // Create sets
        for (let setIndex = 0; setIndex < targetSets; setIndex++) {
          const repTarget = setIndex < targetReps.length ? targetReps[setIndex] : targetReps[targetReps.length - 1];
          
          workoutSetsToInsert.push({
            workout_id: workoutId,
            exercise_id: routineExercise.exercises.id,
            set_order: i * 100 + setIndex,
            reps: parseInt(repTarget) || 0,
            weight: 0,
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
