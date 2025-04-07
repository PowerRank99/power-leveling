
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useWorkoutExercises = () => {
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);

  const fetchRoutineExercises = useCallback(async (routineId: string): Promise<{
    workoutExercises: WorkoutExercise[] | null;
    workoutId: string | null;
  }> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (isCreatingWorkout) {
        console.log("Already creating a workout, preventing duplicate creation");
        return { workoutExercises: null, workoutId: null };
      }

      setIsCreatingWorkout(true);
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
        throw new Error("Rotina não encontrada ou não autorizada");
      }
      
      // Check if there's already an active workout for this routine
      const { data: existingWorkouts, error: existingWorkoutError } = await supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId)
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1);
        
      if (existingWorkoutError) {
        console.error("Error checking for existing workouts:", existingWorkoutError);
      }
      
      // Use existing workout if available
      let workoutId = null;
      if (existingWorkouts && existingWorkouts.length > 0) {
        console.log("Found existing active workout:", existingWorkouts[0].id);
        workoutId = existingWorkouts[0].id;
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
      
      // Create a new workout entry if no active workout exists
      if (!workoutId) {
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
          throw new Error("Falha ao criar registro do treino");
        }

        workoutId = newWorkout.id;
        console.log("New workout created:", workoutId);

        // Create workout_sets entries for each set only for new workouts
        const workoutSetsToInsert = [];
        
        // Format exercises data for UI
        for (let i = 0; i < routineExercises.length; i++) {
          const routineExercise = routineExercises[i];
          const targetSets = routineExercise.target_sets || 3;
          
          // Parse target reps properly
          const targetRepsString = routineExercise.target_reps || '12';
          const targetReps = targetRepsString.includes(',') ? 
            targetRepsString.split(',') : 
            [targetRepsString];
          
          // Create sets
          for (let setIndex = 0; setIndex < targetSets; setIndex++) {
            const repTarget = setIndex < targetReps.length ? targetReps[setIndex] : targetReps[targetReps.length - 1];
            
            workoutSetsToInsert.push({
              workout_id: workoutId,
              exercise_id: routineExercise.exercises.id,
              set_order: i * 100 + setIndex,
              reps: parseInt(repTarget) || 0,
              weight: 0,
              completed: false
            });
          }
        }
        
        if (workoutSetsToInsert.length > 0) {
          console.log("Creating workout sets:", workoutSetsToInsert.length);
          const { error: setsError } = await supabase
            .from('workout_sets')
            .insert(workoutSetsToInsert);
            
          if (setsError) {
            console.error("Error creating workout sets:", setsError);
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
      }

      // Now fetch all workout sets for this workout
      const { data: workoutSets, error: fetchSetsError } = await supabase
        .from('workout_sets')
        .select(`
          id,
          exercise_id,
          set_order,
          weight,
          reps,
          completed
        `)
        .eq('workout_id', workoutId)
        .order('set_order');
        
      if (fetchSetsError) {
        console.error("Error fetching workout sets:", fetchSetsError);
        throw fetchSetsError;
      }

      // Format exercises data for UI with the actual saved sets
      const workoutExercises: WorkoutExercise[] = routineExercises.map(routineExercise => {
        const exercise = routineExercise.exercises;
        
        // Filter sets for this exercise
        const exerciseSets = workoutSets.filter(set => 
          set.exercise_id === exercise.id
        ).sort((a, b) => a.set_order - b.set_order);
        
        // Format sets
        const sets = exerciseSets.map(set => ({
          id: set.id,
          weight: set.weight.toString(),
          reps: set.reps.toString(),
          completed: set.completed,
          previous: {
            weight: set.weight.toString(),
            reps: set.reps.toString()
          }
        }));
        
        return {
          id: exercise.id,
          name: exercise.name,
          sets: sets.length > 0 ? sets : [{
            id: `default-${exercise.id}`,
            weight: '0',
            reps: '12',
            completed: false,
            previous: { weight: '0', reps: '12' }
          }]
        };
      });

      return { 
        workoutExercises,
        workoutId
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
    } finally {
      setIsCreatingWorkout(false);
    }
  }, [user, uiToast, isCreatingWorkout]);
  
  return {
    fetchRoutineExercises,
    isCreatingWorkout
  };
};
