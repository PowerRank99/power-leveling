
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
      
      // If this is a temporary set ID, we need to create it in the database
      if (currentSet.id && (currentSet.id.startsWith('default-') || currentSet.id.startsWith('new-'))) {
        console.log(`Creating new database record for temporary set: ${currentSet.id}`);
        
        const { data: newSet, error: insertError } = await supabase
          .from('workout_sets')
          .insert({
            workout_id: workoutId,
            exercise_id: currentExercise.id,
            set_order: setIndex,
            weight: parseFloat(data.weight || currentSet.weight) || 0,
            reps: parseInt(data.reps || currentSet.reps) || 0,
            completed: data.completed !== undefined ? data.completed : currentSet.completed,
            completed_at: data.completed ? new Date().toISOString() : null
          })
          .select()
          .single();
        
        if (insertError) {
          console.error("Error creating new set in database:", insertError);
          toast.error("Erro ao salvar série", {
            description: "A série não pôde ser criada no banco de dados"
          });
        } else if (newSet) {
          console.log(`Successfully created new set with ID: ${newSet.id}`);
          updatedExercises[exerciseIndex].sets[setIndex].id = newSet.id;
        }
      } 
      // Regular update for existing database records
      else if (Object.keys(setData).length > 0) {
        const { error: updateError } = await supabase
          .from('workout_sets')
          .update(setData)
          .eq('id', currentSet.id);
          
        if (updateError) {
          console.error("Error updating set in database:", updateError);
          toast.error("Erro ao salvar série", {
            description: "As alterações podem não ter sido salvas"
          });
        } else {
          console.log(`Successfully updated set ${currentSet.id} in database`);
        }
      } else {
        console.log(`No changes to save for set ${currentSet.id}`);
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
