import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

export const useRemoveSet = (workoutId: string | null) => {
  const updateRoutineExerciseSetCount = async (exerciseId: string, routineId: string, newSetCount: number) => {
    try {
      const { error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: newSetCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId);
      
      if (error) {
        console.error("Error updating routine exercise set count:", error);
      } else {
        console.log(`Successfully updated routine ${routineId}, exercise ${exerciseId} to ${newSetCount} sets`);
      }
    } catch (error) {
      console.error("Error updating routine exercise set count:", error);
    }
  };

  const removeSet = async (
    exerciseIndex: number, 
    exercises: WorkoutExercise[], 
    setIndex: number, 
    routineId: string
  ) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao remover série", {
          description: "Treino ou exercício não encontrado"
        });
        return null;
      }
      
      const currentExercise = exercises[exerciseIndex];
      const setId = currentExercise.sets[setIndex].id;
      
      if (currentExercise.sets.length <= 1) {
        toast.error("Não é possível remover", {
          description: "Deve haver pelo menos uma série"
        });
        return exercises;
      }
      
      console.log(`Removing set ${setIndex + 1} for exercise ${currentExercise.name}, ID: ${setId}`);
      
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = [
        ...currentExercise.sets.slice(0, setIndex),
        ...currentExercise.sets.slice(setIndex + 1)
      ];
      
      // If this is a temporary ID (not in the database yet), we don't need to delete it
      if (!setId.startsWith('default-') && !setId.startsWith('new-')) {
        const { error } = await supabase
          .from('workout_sets')
          .delete()
          .eq('id', setId);
        
        if (error) {
          console.error("Error removing set:", error);
          toast.error("Erro ao remover série", {
            description: "A série pode não ter sido removida corretamente"
          });
        } else {
          console.log(`Successfully removed set ${setId} from database`);
          
          // Update the set_order for all remaining sets to keep them sequential
          // This is critical to maintain consistency
          await reorderRemainingDatabaseSets(currentExercise.id, workoutId, exerciseIndex, updatedExercises[exerciseIndex].sets);
        }
      }
      
      // Update the routine exercise set count for persistence
      await updateRoutineExerciseSetCount(currentExercise.id, routineId, currentExercise.sets.length - 1);
      
      return updatedExercises;
    } catch (error) {
      console.error("Error removing set:", error);
      toast.error("Erro ao remover série", {
        description: "Não foi possível remover a série"
      });
      return null;
    }
  };
  
  // Helper function to reorder sets after a deletion
  const reorderRemainingDatabaseSets = async (exerciseId: string, workoutId: string, exerciseIndex: number, remainingSets: any[]) => {
    try {
      // Only update sets that are in the database (not temporary)
      const databaseSets = remainingSets.filter(set => 
        !set.id.startsWith('default-') && !set.id.startsWith('new-')
      );
      
      console.log(`Reordering ${databaseSets.length} database sets after removal`);
      
      // Update each set with its new order
      for (let i = 0; i < databaseSets.length; i++) {
        const set = databaseSets[i];
        const newSetOrder = exerciseIndex * 100 + i;
        
        const { error } = await supabase
          .from('workout_sets')
          .update({ set_order: newSetOrder })
          .eq('id', set.id);
          
        if (error) {
          console.error(`Error updating set ${set.id} order:`, error);
        } else {
          console.log(`Updated set ${set.id} order to ${newSetOrder}`);
        }
      }
    } catch (error) {
      console.error("Error reordering sets:", error);
    }
  };

  return { removeSet };
};
