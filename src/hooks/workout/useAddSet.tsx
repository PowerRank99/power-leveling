import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

export const useAddSet = (workoutId: string | null) => {
  const updateRoutineExerciseSetCount = async (exerciseId: string, routineId: string, newSetCount: number) => {
    try {
      console.log(`Updating routine ${routineId}, exercise ${exerciseId} to ${newSetCount} sets`);
      
      // Verify current count first
      const { data: currentData, error: queryError } = await supabase
        .from('routine_exercises')
        .select('target_sets')
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId)
        .single();
      
      if (queryError) {
        console.error("Error checking routine exercise set count:", queryError);
        return false;
      }
      
      // Only update if our new count is different
      if (currentData && currentData.target_sets === newSetCount) {
        console.log(`Current target_sets already matches ${newSetCount}, skipping update`);
        return true;
      }
      
      const { data, error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: newSetCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId)
        .select();
      
      if (error) {
        console.error("Error updating routine exercise set count:", error);
        return false;
      } else {
        console.log("Successfully updated routine exercise target sets:", data);
        return true;
      }
    } catch (error) {
      console.error("Error updating routine exercise set count:", error);
      return false;
    }
  };

  const addSet = async (
    exerciseIndex: number, 
    exercises: WorkoutExercise[], 
    routineId: string
  ) => {
    if (!workoutId || !exercises[exerciseIndex]) {
      console.error("Missing workoutId or invalid exercise index:", { workoutId, exerciseIndex });
      toast.error("Erro ao adicionar série", {
        description: "Treino ou exercício não encontrado"
      });
      return null;
    }
    
    try {
      const currentExercise = exercises[exerciseIndex];
      console.log(`Adding set to exercise ${currentExercise.name} (ID: ${currentExercise.id})`);
      
      // Get current sets
      const updatedExercises = [...exercises];
      const currentSets = updatedExercises[exerciseIndex].sets;
      
      // Filter to find only real sets (not default placeholder sets)
      const realSets = currentSets.filter(set => !set.id.startsWith('default-') && !set.id.startsWith('new-'));
      const lastSet = currentSets[currentSets.length - 1];
      
      // Calculate consistently set order - IMPORTANT: Keep this consistent across the app
      const newSetOrder = realSets.length; // Simple incrementing number within exercise
      console.log(`Adding new set with order ${newSetOrder} for exercise ${currentExercise.name}`);
      
      // Convert values to correct types for database
      const weightValue = lastSet ? parseFloat(lastSet.weight) || 0 : 0;
      const repsValue = lastSet ? parseInt(lastSet.reps) || 12 : 12;
      
      // Create the database record FIRST
      console.log(`Saving new set to database: workout=${workoutId}, exercise=${currentExercise.id}, order=${newSetOrder}, weight=${weightValue}, reps=${repsValue}`);
      
      // Add to database first to ensure persistence
      const { data: newSet, error } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workoutId,
          exercise_id: currentExercise.id,
          set_order: newSetOrder,
          weight: weightValue,
          reps: repsValue,
          completed: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error adding new set:", error);
        console.error("Error details:", error.details, error.hint, error.message);
        toast.error("Erro ao adicionar série", {
          description: "A série não pôde ser salva no banco de dados"
        });
        return exercises; // Return original state on error
      } 
      
      // Verify the data was properly saved
      console.log("Successfully added new set to database with ID:", newSet.id);

      // Now update local state with the database-generated ID
      // First, check if this was replacing a default set
      const defaultSetIndex = currentSets.findIndex(set => set.id.startsWith('default-'));
      
      if (defaultSetIndex !== -1) {
        // Replace the first default set with our new real set
        console.log(`Replacing default set at index ${defaultSetIndex} with real set ${newSet.id}`);
        updatedExercises[exerciseIndex].sets[defaultSetIndex] = {
          id: newSet.id, // Use the real database ID
          weight: String(newSet.weight || 0),
          reps: String(newSet.reps || 12),
          completed: false,
          previous: lastSet?.previous || { weight: '0', reps: '12' }
        };
      } else {
        // No default set to replace, add a new one
        updatedExercises[exerciseIndex].sets.push({
          id: newSet.id, // Use the real database ID
          weight: String(newSet.weight || 0),
          reps: String(newSet.reps || 12),
          completed: false,
          previous: lastSet?.previous || { weight: '0', reps: '12' }
        });
      }
      
      // Count the number of REAL sets now (not default ones)
      const newRealSets = updatedExercises[exerciseIndex].sets.filter(
        set => !set.id.startsWith('default-') && !set.id.startsWith('new-')
      );
      const newSetsCount = newRealSets.length;
      
      // Update the target_sets in routine_exercises to persist for next workouts
      const routineUpdateResult = await updateRoutineExerciseSetCount(
        currentExercise.id, 
        routineId, 
        newSetsCount
      );
      
      if (!routineUpdateResult) {
        console.warn(`Failed to update target sets count for routine ${routineId}, exercise ${currentExercise.id}`);
      }

      // Verify database state after all operations
      const { data: verificationData, error: verificationError } = await supabase
        .from('workout_sets')
        .select('id, set_order, weight, reps, completed')
        .eq('workout_id', workoutId)
        .eq('exercise_id', currentExercise.id)
        .order('set_order');

      if (verificationError) {
        console.error("Error verifying sets after add:", verificationError);
      } else {
        console.log(`Verification: Current sets in database after add: ${verificationData.length}`, verificationData);
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("Error adding set:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar uma nova série"
      });
      return exercises; // Return original state on error
    }
  };

  return { addSet };
};
