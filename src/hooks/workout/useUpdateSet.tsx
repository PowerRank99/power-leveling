
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

export const useUpdateSet = (workoutId: string | null) => {
  const updateSet = async (
    exerciseIndex: number, 
    exercises: WorkoutExercise[], 
    setIndex: number, 
    data: { weight?: string; reps?: string; completed?: boolean }
  ) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao atualizar série", {
          description: "Treino ou exercício não encontrado"
        });
        return null;
      }
      
      const currentExercise = exercises[exerciseIndex];
      const currentSet = currentExercise.sets[setIndex];
      
      if (!currentSet) {
        console.error("Set not found at index", setIndex);
        return null;
      }
      
      // Update local state first for immediate feedback
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data
      };
      
      updatedExercises[exerciseIndex].sets = updatedSets;
      
      // Prepare data for database update
      const setData: Record<string, any> = {};
      
      if (data.weight !== undefined) {
        const weightValue = parseFloat(data.weight) || 0;
        setData.weight = weightValue;
        console.log(`Updating set ${currentSet.id} weight to ${weightValue}`);
      }
      
      if (data.reps !== undefined) {
        const repsValue = parseInt(data.reps) || 0;
        setData.reps = repsValue;
        console.log(`Updating set ${currentSet.id} reps to ${repsValue}`);
      }
      
      if (data.completed !== undefined) {
        setData.completed = data.completed;
        setData.completed_at = data.completed ? new Date().toISOString() : null;
        console.log(`Updating set ${currentSet.id} completed to ${data.completed}`);
      }
      
      // Skip the database update if the ID starts with "default-" or "new-"
      // These are temporary IDs for sets that don't exist in the database yet
      if (currentSet.id && !currentSet.id.startsWith('default-') && !currentSet.id.startsWith('new-')) {
        const { error } = await supabase
          .from('workout_sets')
          .update(setData)
          .eq('id', currentSet.id);
          
        if (error) {
          console.error("Error updating set in database:", error);
          toast.error("Erro ao salvar série", {
            description: "As alterações podem não ter sido salvas"
          });
        } else {
          console.log(`Successfully updated set ${currentSet.id} in database`);
        }
      } else {
        console.warn(`Skipping database update for temporary set ID: ${currentSet.id}`);
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

  return { updateSet };
};
