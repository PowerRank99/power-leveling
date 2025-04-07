
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFetchRoutineExercises = () => {
  /**
   * Fetches exercises for a routine with proper join
   */
  const fetchRoutineExerciseData = async (routineId: string) => {
    if (!routineId) {
      throw new Error("Routine ID is required");
    }

    console.log("Fetching routine exercises for routine ID:", routineId);
    
    const { data: routineExercises, error: exercisesError } = await supabase
      .from('routine_exercises')
      .select(`
        id,
        target_sets,
        target_reps,
        display_order,
        exercises (
          id,
          name
        )
      `)
      .eq('routine_id', routineId)
      .order('display_order');
    
    if (exercisesError) {
      console.error("Error fetching routine exercises:", exercisesError);
      throw exercisesError;
    }
    
    if (!routineExercises || routineExercises.length === 0) {
      toast.error("Rotina sem exercícios", {
        description: "Não foi possível encontrar exercícios para esta rotina."
      });
      
      throw new Error("Não foi possível encontrar exercícios para esta rotina.");
    }
    
    return routineExercises;
  };

  return {
    fetchRoutineExerciseData
  };
};
