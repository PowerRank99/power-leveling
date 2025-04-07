
import { supabase } from '@/integrations/supabase/client';

export const useWorkoutCreation = () => {
  /**
   * Creates a new workout entry for a routine
   */
  const createNewWorkout = async (routineId: string, userId: string) => {
    if (!routineId || !userId) {
      throw new Error("Cannot create workout: Missing routine ID or user ID");
    }
    
    console.log("Creating new workout for routine:", routineId);
    
    const { data: newWorkout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        routine_id: routineId,
        started_at: new Date().toISOString(),
        user_id: userId
      })
      .select()
      .single();
      
    if (workoutError) {
      console.error("Error creating workout:", workoutError);
      throw workoutError;
    }
    
    if (!newWorkout) {
      throw new Error("Falha ao criar registro do treino");
    }

    console.log("New workout created:", newWorkout.id);
    return newWorkout.id;
  };

  return {
    createNewWorkout
  };
};
