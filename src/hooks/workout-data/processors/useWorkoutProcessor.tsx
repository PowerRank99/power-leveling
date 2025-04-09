
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RecentWorkout } from '@/hooks/types/workoutDataTypes';

export const useWorkoutProcessor = () => {
  // Process workout data with details
  const processWorkouts = useCallback(async (workouts: any[]): Promise<RecentWorkout[]> => {
    if (!workouts || workouts.length === 0) return [];
    
    // Process workouts with additional details
    const workoutsWithDetails = await Promise.all(workouts.map(async (workout) => {
      try {
        let routineName = 'Treino sem nome';
        if (workout.routine_id) {
          const { data: routineData, error: routineError } = await supabase
            .from('routines')
            .select('name')
            .eq('id', workout.routine_id)
            .single();
            
          if (routineError) {
            console.error(`Error fetching routine for workout ${workout.id}:`, routineError);
          }
          
          if (routineData) {
            routineName = routineData.name;
          }
        }
        
        const { count: setsCount, error: setsError } = await supabase
          .from('workout_sets')
          .select('*', { count: 'exact', head: true })
          .eq('workout_id', workout.id);
          
        if (setsError) {
          console.error(`Error fetching sets count for workout ${workout.id}:`, setsError);
        }
          
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('workout_sets')
          .select('exercise_id')
          .eq('workout_id', workout.id);
          
        if (exercisesError) {
          console.error(`Error fetching exercises for workout ${workout.id}:`, exercisesError);
        }
          
        const uniqueExercises = new Set();
        if (exercisesData) {
          exercisesData.forEach(item => {
            if (item.exercise_id) {
              uniqueExercises.add(item.exercise_id);
            }
          });
        }
        
        return {
          id: workout.id,
          name: routineName,
          date: new Date(workout.completed_at || workout.started_at).toLocaleDateString('pt-BR'),
          exercises_count: uniqueExercises.size,
          sets_count: setsCount || 0,
          prs: 0,
          duration_seconds: workout.duration_seconds,
        };
      } catch (err) {
        console.error(`Error processing workout ${workout.id}:`, err);
        // Return a basic workout object if there's an error
        return {
          id: workout.id,
          name: 'Treino sem nome',
          date: new Date(workout.completed_at || workout.started_at).toLocaleDateString('pt-BR'),
          exercises_count: 0,
          sets_count: 0,
          prs: 0,
          duration_seconds: workout.duration_seconds,
        };
      }
    }));
    
    return workoutsWithDetails;
  }, []);

  return {
    processWorkouts
  };
};
