
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';

export const useWorkoutExercises = () => {
  const { toast } = useToast();

  const fetchRoutineExercises = async (routineId: string): Promise<{
    workoutExercises: WorkoutExercise[] | null;
    workoutId: string | null;
  }> => {
    try {
      const { data: routineExercises, error: routineError } = await supabase
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
      
      if (routineError) {
        throw routineError;
      }
      
      if (!routineExercises || routineExercises.length === 0) {
        toast({
          title: "Rotina não encontrada",
          description: "Não foi possível encontrar exercícios para esta rotina.",
          variant: "destructive"
        });
        return { workoutExercises: null, workoutId: null };
      }
      
      // Create a new workout entry
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          routine_id: routineId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (workoutError) {
        throw workoutError;
      }
      
      if (!newWorkout) {
        throw new Error("Failed to create workout");
      }

      // Format exercises data
      const workoutExercises: WorkoutExercise[] = routineExercises.map(routineExercise => {
        const exercise = routineExercise.exercises;
        const targetSets = routineExercise.target_sets || 3;
        const targetReps = routineExercise.target_reps?.split(',') || ['12'];
        
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
          reps: parseInt(set.reps),
          weight: parseFloat(set.weight) || 0,
          completed: false
        }))
      );
      
      if (workoutSetsToInsert.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(workoutSetsToInsert);
          
        if (setsError) {
          console.error("Error creating workout sets:", setsError);
        }
      }

      return { 
        workoutExercises,
        workoutId: newWorkout.id
      };
      
    } catch (error) {
      console.error("Error setting up workout:", error);
      toast({
        title: "Erro ao iniciar treino",
        description: "Não foi possível iniciar o treino. Tente novamente.",
        variant: "destructive"
      });
      return { workoutExercises: null, workoutId: null };
    }
  };
  
  return {
    fetchRoutineExercises
  };
};
