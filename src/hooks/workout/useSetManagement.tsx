
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

export const useSetManagement = (workoutId: string | null) => {
  const updateSet = async (exerciseIndex: number, exercises: WorkoutExercise[], setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao atualizar série", {
          description: "Treino ou exercício não encontrado"
        });
        return;
      }
      
      const currentExercise = exercises[exerciseIndex];
      
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data
      };
      
      updatedExercises[exerciseIndex].sets = updatedSets;
      
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
        .eq('id', updatedSets[setIndex].id);
        
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
  
  const addSet = async (exerciseIndex: number, exercises: WorkoutExercise[], routineId: string) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao adicionar série", {
          description: "Treino ou exercício não encontrado"
        });
        return null;
      }
      
      const currentExercise = exercises[exerciseIndex];
      
      const updatedExercises = [...exercises];
      const currentSets = updatedExercises[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      
      const newSetId = `new-${Date.now()}`;
      const newSet = {
        id: newSetId,
        weight: lastSet?.weight || '0',
        reps: lastSet?.reps || '12',
        completed: false,
        previous: lastSet?.previous || { weight: '0', reps: '12' }
      };
      
      updatedExercises[exerciseIndex].sets.push(newSet);
      
      const newSetOrder = currentSets.length;
      
      const { data, error } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workoutId,
          exercise_id: currentExercise.id,
          set_order: newSetOrder,
          weight: parseFloat(newSet.weight) || 0,
          reps: parseInt(newSet.reps) || 0,
          completed: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error adding new set:", error);
        toast.error("Erro ao adicionar série", {
          description: "A série pode não ter sido salva corretamente"
        });
      }
      
      if (data) {
        const updatedExercisesWithId = [...updatedExercises];
        const setIndex = updatedExercisesWithId[exerciseIndex].sets.length - 1;
        updatedExercisesWithId[exerciseIndex].sets[setIndex].id = data.id;
        
        updateRoutineExerciseSetCount(currentExercise.id, routineId, currentSets.length + 1);
        
        return updatedExercisesWithId;
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("Error adding set:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar uma nova série"
      });
      return null;
    }
  };
  
  const removeSet = async (exerciseIndex: number, exercises: WorkoutExercise[], setIndex: number, routineId: string) => {
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
      
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = [
        ...currentExercise.sets.slice(0, setIndex),
        ...currentExercise.sets.slice(setIndex + 1)
      ];
      
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
        updateRoutineExerciseSetCount(currentExercise.id, routineId, currentExercise.sets.length - 1);
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("Error removing set:", error);
      toast.error("Erro ao remover série", {
        description: "Não foi possível remover a série"
      });
      return null;
    }
  };
  
  const updateRoutineExerciseSetCount = async (exerciseId: string, routineId: string, newSetCount: number) => {
    try {
      const { error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: newSetCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId);
      
      if (error) {
        console.error("Error updating routine exercise set count:", error);
      }
    } catch (error) {
      console.error("Error updating routine exercise set count:", error);
    }
  };
  
  return {
    updateSet,
    addSet,
    removeSet
  };
};
