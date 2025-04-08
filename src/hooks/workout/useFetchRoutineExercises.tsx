
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFetchRoutineExercises = () => {
  /**
   * Fetches exercises for a routine with proper join and validation
   */
  const fetchRoutineExerciseData = async (routineId: string) => {
    if (!routineId) {
      throw new Error("ID da rotina não fornecido");
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
      throw new Error(`Erro ao buscar exercícios: ${exercisesError.message}`);
    }
    
    // Check if we have valid exercises data
    if (!routineExercises || routineExercises.length === 0) {
      const errorMessage = "Esta rotina não possui exercícios";
      console.error(errorMessage);
      
      // Return empty array instead of throwing error to allow better UI handling
      return [];
    }
    
    return routineExercises;
  };

  return {
    fetchRoutineExerciseData
  };
};
