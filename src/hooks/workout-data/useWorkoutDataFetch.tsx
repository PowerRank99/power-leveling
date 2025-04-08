
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Routine, RecentWorkout } from '../types/workoutDataTypes';

export const useWorkoutDataFetch = (
  userId: string | undefined,
  setRoutines: (routines: Routine[]) => void,
  setWorkouts: (workouts: RecentWorkout[]) => void,
  deletedWorkoutIds: string[],
  pathname: string,
  lastRefresh: number
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Function to force a refresh
  const refreshData = useCallback(() => {
    console.log("Force refreshing workout data");
    // We'll trigger a refetch through the dependency array
    setError(null);
  }, []);

  // Fetch data effect
  useEffect(() => {
    let isMounted = true;
    const fetchUserRoutines = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching workout data...");
        
        // Fetch routines
        const { data: routines, error: routinesError } = await supabase
          .from('routines')
          .select('id, name, last_used_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (routinesError) {
          console.error("Error fetching routines:", routinesError);
          throw routinesError;
        }
        
        if (routines && routines.length > 0 && isMounted) {
          console.log(`Found ${routines.length} routines`);
          
          // Process routines with exercise counts
          const routinesWithCounts = await Promise.all(routines.map(async (routine) => {
            try {
              const { count, error } = await supabase
                .from('routine_exercises')
                .select('*', { count: 'exact', head: true })
                .eq('routine_id', routine.id);
                
              return {
                ...routine,
                exercises_count: count || 0
              };
            } catch (err) {
              console.error(`Error fetching exercise count for routine ${routine.id}:`, err);
              return {
                ...routine,
                exercises_count: 0
              };
            }
          }));
          
          if (isMounted) {
            setRoutines(routinesWithCounts);
          }
        } else if (isMounted) {
          console.log("No routines found or user not authenticated");
          setRoutines([]);
        }
        
        // Fetch recent workouts - UPDATED to only show completed workouts and filter out deleted ones
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('id, started_at, completed_at, duration_seconds, routine_id')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5);
        
        if (workoutsError) {
          console.error("Error fetching workouts:", workoutsError);
          throw workoutsError;
        }
        
        if (workouts && workouts.length > 0 && isMounted) {
          console.log(`Found ${workouts.length} completed workouts`);
          
          // Filter out any deleted workouts
          const filteredWorkouts = workouts.filter(
            workout => !deletedWorkoutIds.includes(workout.id)
          );
          
          console.log(`After filtering deleted workouts: ${filteredWorkouts.length} workouts remain`);
          
          // Process workouts with additional details
          const workoutsWithDetails = await Promise.all(filteredWorkouts.map(async (workout) => {
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
          
          if (isMounted) {
            setWorkouts(workoutsWithDetails);
          }
        } else if (isMounted) {
          console.log("No completed workouts found");
          setWorkouts([]);
        }
      } catch (error: any) {
        console.error('Error fetching workout data:', error);
        if (isMounted) {
          setError(error.message || "Não foi possível carregar seus treinos");
          toast({
            title: 'Erro ao carregar dados',
            description: 'Não foi possível carregar seus treinos. Tente novamente mais tarde.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasAttemptedLoad(true);
        }
      }
    };
    
    fetchUserRoutines();
    
    return () => {
      isMounted = false;
    };
  }, [userId, toast, pathname, lastRefresh, setRoutines, setWorkouts, deletedWorkoutIds]);

  return {
    isLoading,
    refreshData,
    error,
    hasAttemptedLoad
  };
};
