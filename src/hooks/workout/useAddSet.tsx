
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

export const useAddSet = (workoutId: string | null) => {
  const updateRoutineExerciseSetCount = async (exerciseId: string, routineId: string, newSetCount: number) => {
    try {
      console.log(`Updating routine ${routineId}, exercise ${exerciseId} to ${newSetCount} sets`);
      
      const { error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: newSetCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId);
      
      if (error) {
        console.error("Error updating routine exercise set count:", error);
      } else {
        console.log("Successfully updated routine exercise target sets");
      }
    } catch (error) {
      console.error("Error updating routine exercise set count:", error);
    }
  };

  const addSet = async (
    exerciseIndex: number, 
    exercises: WorkoutExercise[], 
    routineId: string
  ) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao adicionar série", {
          description: "Treino ou exercício não encontrado"
        });
        return null;
      }
      
      const currentExercise = exercises[exerciseIndex];
      
      // Get current sets and determine the next set order
      const updatedExercises = [...exercises];
      const currentSets = updatedExercises[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      
      // Determine the next set order
      const newSetOrder = currentSets.length;
      console.log(`Adding new set with order ${newSetOrder} for exercise ${currentExercise.name}`);
      
      // Create the temporary set object
      const newSetId = `new-${Date.now()}`;
      const newSet = {
        id: newSetId,
        weight: lastSet?.weight || '0',
        reps: lastSet?.reps || '12',
        completed: false,
        previous: lastSet?.previous || { weight: '0', reps: '12' }
      };
      
      // Add to local state
      updatedExercises[exerciseIndex].sets.push(newSet);
      
      // Add to database
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
      } else {
        console.log("Successfully added new set to database with ID:", data.id);
      }
      
      if (data) {
        // Update the ID in our state with the real one from the database
        const updatedExercisesWithId = [...updatedExercises];
        const setIndex = updatedExercisesWithId[exerciseIndex].sets.length - 1;
        updatedExercisesWithId[exerciseIndex].sets[setIndex].id = data.id;
        
        // Update the target_sets in routine_exercises to persist for next workouts
        await updateRoutineExerciseSetCount(currentExercise.id, routineId, currentSets.length + 1);
        
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

  return { addSet };
};
