
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RecentWorkout } from '../types/workoutDataTypes';

export const useFetchWorkouts = (
  userId: string | undefined,
  setWorkouts: (workouts: RecentWorkout[] | ((prev: RecentWorkout[]) => RecentWorkout[])) => void,
  deletedWorkoutIds: string[],
  lastRefresh: number
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const WORKOUTS_PER_PAGE = 5;

  // Fetch workouts with pagination
  const fetchWorkouts = useCallback(async (page: number = 1) => {
    if (!userId) return { data: [], hasMore: false };
    
    try {
      console.log(`Fetching workouts data for page ${page}...`);
      
      // Calculate offset
      const offset = (page - 1) * WORKOUTS_PER_PAGE;
      
      // Fetch recent workouts with pagination
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('id, started_at, completed_at, duration_seconds, routine_id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .range(offset, offset + WORKOUTS_PER_PAGE - 1);
      
      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        throw workoutsError;
      }
      
      // Check if we have more data
      const hasMore = workouts && workouts.length === WORKOUTS_PER_PAGE;
      
      // Filter out deleted workouts
      const filteredWorkouts = workouts ? workouts.filter(
        workout => !deletedWorkoutIds.includes(workout.id)
      ) : [];
      
      console.log(`After filtering deleted workouts: ${filteredWorkouts.length} workouts remain`);
      
      return { 
        data: filteredWorkouts, 
        hasMore 
      };
    } catch (error) {
      console.error('Error in fetchWorkouts:', error);
      throw error;
    }
  }, [userId, WORKOUTS_PER_PAGE, deletedWorkoutIds]);

  // Process workout data with details
  const processWorkouts = useCallback(async (workouts: any[]) => {
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

  // Main useEffect for initial page load
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialWorkouts = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setCurrentPage(1); // Reset to page 1 when user ID or refresh changes
        
        const { data: workoutsData, hasMore } = await fetchWorkouts(1);
        const processedWorkouts = await processWorkouts(workoutsData);
        
        if (isMounted) {
          setWorkouts(processedWorkouts);
          setHasMoreWorkouts(hasMore);
          setError(null);
        }
      } catch (error: any) {
        console.error('Error loading initial workout data:', error);
        if (isMounted) {
          setError(error.message || "Não foi possível carregar seus treinos");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasAttemptedLoad(true);
        }
      }
    };
    
    loadInitialWorkouts();
    
    return () => {
      isMounted = false;
    };
  }, [userId, setWorkouts, lastRefresh, fetchWorkouts, processWorkouts]);
  
  // Function to load more workouts (next page)
  const loadMoreWorkouts = useCallback(async () => {
    if (!userId || !hasMoreWorkouts) return false;
    
    try {
      setIsLoading(true);
      const nextPage = currentPage + 1;
      
      const { data: workoutsData, hasMore } = await fetchWorkouts(nextPage);
      const processedWorkouts = await processWorkouts(workoutsData);
      
      setWorkouts((prev: RecentWorkout[]) => [...prev, ...processedWorkouts]);
      setCurrentPage(nextPage);
      setHasMoreWorkouts(hasMore);
      return true;
    } catch (error: any) {
      console.error('Error loading more workouts:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPage, hasMoreWorkouts, fetchWorkouts, processWorkouts, setWorkouts]);

  return {
    isLoadingWorkouts: isLoading,
    workoutsError: error,
    hasAttemptedWorkoutsLoad: hasAttemptedLoad,
    hasMoreWorkouts,
    loadMoreWorkouts
  };
};
