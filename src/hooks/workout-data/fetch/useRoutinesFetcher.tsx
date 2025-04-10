
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Routine } from '../../types/workoutDataTypes';

export const useRoutinesFetcher = (
  userId: string | undefined,
  setRoutines: (routines: Routine[]) => void,
  lastRefresh: number
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Fetch routines effect
  useEffect(() => {
    let isMounted = true;
    
    const fetchRoutines = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching routines data...");
        
        const { data: routines, error: routinesError } = await supabase
          .from('routines')
          .select('id, name, last_used_at, created_at')  // Added created_at here
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
        
        if (isMounted) {
          setError(null);
        }
      } catch (error: any) {
        console.error('Error fetching routines data:', error);
        if (isMounted) {
          setError(error.message || "Não foi possível carregar suas rotinas");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasAttemptedLoad(true);
        }
      }
    };
    
    fetchRoutines();
    
    return () => {
      isMounted = false;
    };
  }, [userId, setRoutines, lastRefresh]);

  return {
    isLoading,
    error,
    hasAttemptedLoad
  };
};
