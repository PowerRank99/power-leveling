
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

export const useUpdateSet = (workoutId: string | null) => {
  /**
   * Updates a workout set with new values
   * @param exerciseIndex The exercise index in the exercises array
   * @param exercises The array of exercises
   * @param setIndex The index of the set within the exercise
   * @param data The data to update (weight, reps, completed status)
   */
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
        console.error(`[useUpdateSet] Set not found at index ${setIndex} for exercise ${currentExercise.name}`);
        return null;
      }
      
      console.log(`[useUpdateSet] Updating set for ${currentExercise.name}, set #${setIndex + 1}`, data);
      
      // Update local state first for immediate feedback
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data
      };
      
      updatedExercises[exerciseIndex].sets = updatedSets;
      
      // Prepare data for database update - ensure consistent formatting
      const setData: Record<string, any> = {};
      
      // Never send empty values to the database
      if (data.weight !== undefined) {
        const weightValue = data.weight === '' ? 0 : parseFloat(data.weight) || 0;
        setData.weight = weightValue;
        console.log(`[useUpdateSet] Setting weight to ${weightValue} for set #${setIndex + 1}`);
      }
      
      if (data.reps !== undefined) {
        const repsValue = data.reps === '' ? 0 : parseInt(data.reps) || 0;
        setData.reps = repsValue;
        console.log(`[useUpdateSet] Setting reps to ${repsValue} for set #${setIndex + 1}`);
      }
      
      if (data.completed !== undefined) {
        setData.completed = data.completed;
        setData.completed_at = data.completed ? new Date().toISOString() : null;
      }
      
      // Only make a database call if we have something to update
      if (Object.keys(setData).length === 0) {
        console.log(`[useUpdateSet] No changes to save for set ID: ${currentSet.id}`);
        return updatedExercises;
      }
      
      // Handle temporary IDs (default- or new- prefixed IDs)
      if (currentSet.id.startsWith('default-') || currentSet.id.startsWith('new-')) {
        console.log(`[useUpdateSet] Creating new database record for temp set ID: ${currentSet.id}`);
        
        // Generate a stable set_order - use exerciseIndex*100 + setIndex for consistency
        const setOrder = exerciseIndex * 100 + setIndex;
        
        const { data: newSet, error: insertError } = await supabase
          .from('workout_sets')
          .insert({
            workout_id: workoutId,
            exercise_id: currentExercise.id,
            set_order: setOrder,
            weight: parseFloat(data.weight ?? currentSet.weight) || 0,
            reps: parseInt(data.reps ?? currentSet.reps) || 0,
            completed: data.completed !== undefined ? data.completed : currentSet.completed,
            completed_at: data.completed ? new Date().toISOString() : null
          })
          .select()
          .single();
        
        if (insertError) {
          console.error("[useUpdateSet] Error creating set in database:", insertError);
          toast.error("Erro ao salvar série", {
            description: "A série não pôde ser criada no banco de dados"
          });
        } else if (newSet) {
          console.log(`[useUpdateSet] Successfully created new set with ID: ${newSet.id}, set_order: ${setOrder}`);
          // Update the ID in our local state with the real database ID
          updatedExercises[exerciseIndex].sets[setIndex].id = newSet.id;
        }
      } 
      // Regular update for existing database records - make sure we don't overwrite values unnecessarily
      else if (Object.keys(setData).length > 0) {
        console.log(`[useUpdateSet] Updating existing set ID: ${currentSet.id} in database with:`, setData);
        
        try {
          // Use select() to verify the data was updated correctly
          const { data: updatedData, error: updateError } = await supabase
            .from('workout_sets')
            .update(setData)
            .eq('id', currentSet.id)
            .select('weight, reps, completed');
            
          if (updateError) {
            console.error("[useUpdateSet] Error updating set in database:", updateError);
            toast.error("Erro ao salvar série", {
              description: "As alterações podem não ter sido salvas"
            });
          } else {
            console.log(`[useUpdateSet] Successfully updated set ${currentSet.id} in database:`, updatedData);
          }
        } catch (err) {
          console.error("[useUpdateSet] Exception during database update:", err);
          // Continue execution - don't block the UI for database errors
        }
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("[useUpdateSet] Error updating set:", error);
      toast.error("Erro ao atualizar série", {
        description: "Não foi possível salvar as alterações"
      });
      return null;
    }
  };

  return { updateSet };
};
