
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, PreviousSetData } from '@/types/workout';
import { toast } from 'sonner';

export const useWorkoutSetAdd = (workoutId: string | null, exercises: WorkoutExercise[], currentExerciseIndex: number) => {
  const addSet = async () => {
    if (!workoutId || !exercises[currentExerciseIndex]) {
      toast.error("Erro ao adicionar série", {
        description: "Treino ou exercício não encontrado"
      });
      return null;
    }
    
    try {
      const currentExercise = exercises[currentExerciseIndex];
      
      // Add to local state first
      const updatedExercises = [...exercises];
      const currentSets = updatedExercises[currentExerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      
      const newSetId = `new-${Date.now()}`;
      
      // Create a properly structured previous set data
      const previousData: PreviousSetData = {
        id: newSetId,
        exercise_id: currentExercise.id,
        weight: lastSet?.weight || '0',
        reps: lastSet?.reps || '12',
        set_order: currentSets.length
      };
      
      const newSet = {
        id: newSetId,
        weight: lastSet?.weight || '0',
        reps: lastSet?.reps || '12',
        completed: false,
        previous: previousData
      };
      
      updatedExercises[currentExerciseIndex].sets.push(newSet);
      
      // Add to database
      const newSetOrder = currentExerciseIndex * 100 + updatedExercises[currentExerciseIndex].sets.length - 1;
      
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
      
      // If we got data back, update the ID
      if (data) {
        const setIndex = updatedExercises[currentExerciseIndex].sets.length - 1;
        updatedExercises[currentExerciseIndex].sets[setIndex].id = data.id;
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
  
  return {
    addSet
  };
};
