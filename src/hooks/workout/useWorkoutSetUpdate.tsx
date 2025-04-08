
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

export const useWorkoutSetUpdate = (workoutId: string | null, exercises: WorkoutExercise[], currentExerciseIndex: number) => {
  const updateSet = async (setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    if (!workoutId || !exercises[currentExerciseIndex]) {
      toast.error("Erro ao atualizar série", {
        description: "Treino ou exercício não encontrado"
      });
      return null;
    }
    
    try {
      const currentExercise = exercises[currentExerciseIndex];
      
      // Update local state first
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[currentExerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data
      };
      
      updatedExercises[currentExerciseIndex].sets = updatedSets;
      
      // Update in database
      const setData: Record<string, any> = {};
      if (data.weight !== undefined) setData.weight = parseFloat(data.weight) || 0;
      if (data.reps !== undefined) setData.reps = parseInt(data.reps) || 0;
      if (data.completed !== undefined) {
        setData.completed = data.completed;
        if (data.completed) {
          setData.completed_at = new Date().toISOString();
        } else {
          setData.completed_at = null;
        }
      }
      
      const { error } = await supabase
        .from('workout_sets')
        .update(setData)
        .eq('workout_id', workoutId)
        .eq('exercise_id', currentExercise.id)
        .eq('set_order', currentExerciseIndex * 100 + setIndex);
        
      if (error) {
        console.error("Error updating set:", error);
        toast.error("Erro ao salvar série", {
          description: "As alterações podem não ter sido salvas"
        });
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("Error updating set:", error);
      toast.error("Erro ao atualizar série", {
        description: "Não foi possível salvar as alterações"
      });
      return null;
    }
  };
  
  return {
    updateSet
  };
};
