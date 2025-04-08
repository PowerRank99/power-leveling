
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';

export interface Routine {
  id: string;
  name: string;
  exercises_count?: number;
  last_used_at?: string | null;
}

export interface RecentWorkout {
  id: string;
  name: string;
  date: string;
  exercises_count: number;
  sets_count: number;
  prs?: number;
  duration_seconds?: number | null;
}

export const useWorkoutData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Function to force a refresh
  const refreshData = useCallback(() => {
    console.log("Force refreshing workout data");
    setLastRefresh(Date.now());
    setError(null);
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    const fetchUserRoutines = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching workout data...");
        
        // Fetch routines
        const { data: routines, error: routinesError } = await supabase
          .from('routines')
          .select('id, name, last_used_at')
          .eq('user_id', user.id)
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
            setSavedRoutines(routinesWithCounts);
          }
        } else if (isMounted) {
          console.log("No routines found or user not authenticated");
          setSavedRoutines([]);
        }
        
        // Fetch recent workouts - UPDATED to only show completed workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('id, started_at, completed_at, duration_seconds, routine_id')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null) // Only get completed workouts
          .order('completed_at', { ascending: false }) // Order by completed_at instead of started_at
          .limit(5);
        
        if (workoutsError) {
          console.error("Error fetching workouts:", workoutsError);
          throw workoutsError;
        }
        
        if (workouts && workouts.length > 0 && isMounted) {
          console.log(`Found ${workouts.length} completed workouts`);
          
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
          
          if (isMounted) {
            setRecentWorkouts(workoutsWithDetails);
          }
        } else if (isMounted) {
          console.log("No completed workouts found");
          setRecentWorkouts([]);
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
  }, [user, toast, location.pathname, lastRefresh]); // Added location.pathname and lastRefresh as dependencies

  return {
    savedRoutines,
    recentWorkouts,
    isLoading,
    refreshData,
    error,
    hasAttemptedLoad
  };
};
