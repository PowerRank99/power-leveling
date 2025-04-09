
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFetchWorkoutsPagination = (
  userId: string | undefined,
  deletedWorkoutIds: string[]
) => {
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

  return {
    fetchWorkouts,
    hasMoreWorkouts,
    setHasMoreWorkouts,
    currentPage,
    setCurrentPage,
    WORKOUTS_PER_PAGE
  };
};
