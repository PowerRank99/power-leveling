
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useWorkoutExercises = () => {
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  const fetchRoutineExercises = async (routineId: string): Promise<{
    workoutExercises: WorkoutExercise[] | null;
    workoutId: string | null;
  }> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Fetching routine exercises for routine ID:", routineId);
      
      // First verify the routine exists and belongs to the user
      const { data: routineData, error: routineCheckError } = await supabase
        .from('routines')
        .select('id, name')
        .eq('id', routineId)
        .eq('user_id', user.id)
        .single();
      
      if (routineCheckError) {
        console.error("Error verifying routine:", routineCheckError);
        throw new Error("Routine not found or not authorized");
      }
      
      // Get exercises for the routine with proper join
      const { data: routineExercises, error: exercisesError } = await supabase
        .from('routine_exercises')
        .select(`
          id,
          target_sets,
          target_reps,
          display_order,
          exercises (
            id,
            name
          )
        `)
        .eq('routine_id', routineId)
        .order('display_order');
      
      if (exercisesError) {
        console.error("Error fetching routine exercises:", exercisesError);
        throw exercisesError;
      }
      
      if (!routineExercises || routineExercises.length === 0) {
        toast.error("Rotina sem exercícios", {
          description: "Não foi possível encontrar exercícios para esta rotina."
        });
        
        uiToast({
          title: "Rotina não encontrada",
          description: "Não foi possível encontrar exercícios para esta rotina.",
          variant: "destructive"
        });
        
        return { workoutExercises: null, workoutId: null };
      }
      
      // Create a new workout entry
      console.log("Creating new workout for routine:", routineId);
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          routine_id: routineId,
          started_at: new Date().toISOString(),
          user_id: user.id
        })
        .select()
        .single();
        
      if (workoutError) {
        console.error("Error creating workout:", workoutError);
        throw workoutError;
      }
      
      if (!newWorkout) {
        throw new Error("Failed to create workout record");
      }

      console.log("New workout created:", newWorkout.id);

      // Format exercises data for UI
      const workoutExercises: WorkoutExercise[] = routineExercises.map(routineExercise => {
        const exercise = routineExercise.exercises;
        const targetSets = routineExercise.target_sets || 3;
        
        // Parse target reps properly
        const targetRepsString = routineExercise.target_reps || '12';
        const targetReps = targetRepsString.includes(',') ? 
          targetRepsString.split(',') : 
          [targetRepsString];
        
        // Create sets with proper defaults
        const sets = Array.from({ length: targetSets }).map((_, index) => {
          const repTarget = index < targetReps.length ? targetReps[index] : targetReps[targetReps.length - 1];
          
          return {
            id: `${index}`,
            weight: '0',
            reps: repTarget,
            completed: false,
            previous: {
              weight: '0',
              reps: repTarget
            }
          };
        });
        
        return {
          id: exercise.id,
          name: exercise.name,
          sets
        };
      });

      // Create workout_sets entries for each set
      const workoutSetsToInsert = workoutExercises.flatMap((exercise, exerciseIndex) => 
        exercise.sets.map((set, setIndex) => ({
          workout_id: newWorkout.id,
          exercise_id: exercise.id,
          set_order: exerciseIndex * 100 + setIndex,
          reps: parseInt(set.reps) || 0,
          weight: parseFloat(set.weight) || 0,
          completed: false
        }))
      );
      
      if (workoutSetsToInsert.length > 0) {
        console.log("Creating workout sets:", workoutSetsToInsert.length);
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(workoutSetsToInsert);
          
        if (setsError) {
          console.error("Error creating workout sets:", setsError);
          // Don't throw here, log and continue
          toast.error("Erro ao criar séries", {
            description: "Algumas séries podem não ter sido criadas."
          });
        }
      }

      // Update last_used_at for the routine
      await supabase
        .from('routines')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', routineId);

      return { 
        workoutExercises,
        workoutId: newWorkout.id
      };
      
    } catch (error: any) {
      console.error("Error setting up workout:", error);
      
      toast.error("Erro ao iniciar treino", {
        description: error.message || "Não foi possível iniciar o treino. Tente novamente."
      });
      
      uiToast({
        title: "Erro ao iniciar treino",
        description: error.message || "Não foi possível iniciar o treino. Tente novamente.",
        variant: "destructive"
      });
      
      return { workoutExercises: null, workoutId: null };
    }
  };
  
  return {
    fetchRoutineExercises
  };
};
