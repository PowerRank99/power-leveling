
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PreviousWorkoutData {
  [exerciseId: string]: {
    weight: string;
    reps: string;
  }[];
}

interface RestTimerSettings {
  minutes: number;
  seconds: number;
}

export const usePreviousWorkoutData = (routineId: string | null) => {
  const { user } = useAuth();
  const [previousWorkoutData, setPreviousWorkoutData] = useState<PreviousWorkoutData>({});
  const [restTimerSettings, setRestTimerSettings] = useState<RestTimerSettings>({ minutes: 1, seconds: 30 });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchPreviousWorkoutData = async () => {
      if (!routineId || !user) return;
      
      try {
        setIsLoading(true);
        
        // 1. Get the most recent completed workout for this routine
        const { data: previousWorkout, error: workoutError } = await supabase
          .from('workouts')
          .select('id, rest_timer_minutes, rest_timer_seconds')
          .eq('routine_id', routineId)
          .eq('user_id', user.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();
          
        if (workoutError) {
          console.log("No previous workout found for routine:", routineId);
          return;
        }
        
        // Set previous rest timer settings if available
        if (previousWorkout?.rest_timer_minutes !== null && previousWorkout?.rest_timer_seconds !== null) {
          setRestTimerSettings({
            minutes: previousWorkout.rest_timer_minutes || 1,
            seconds: previousWorkout.rest_timer_seconds || 30
          });
        }
        
        // 2. Get all sets from the previous workout
        const { data: previousSets, error: setsError } = await supabase
          .from('workout_sets')
          .select(`
            id,
            exercise_id,
            weight,
            reps,
            completed
          `)
          .eq('workout_id', previousWorkout.id)
          .eq('completed', true) // Only get completed sets
          .order('set_order');
          
        if (setsError) {
          console.error("Error fetching previous workout sets:", setsError);
          return;
        }
        
        // 3. Group sets by exercise ID
        const groupedSets: PreviousWorkoutData = {};
        
        if (previousSets) {
          previousSets.forEach(set => {
            if (!set.exercise_id) return;
            
            if (!groupedSets[set.exercise_id]) {
              groupedSets[set.exercise_id] = [];
            }
            
            groupedSets[set.exercise_id].push({
              weight: set.weight?.toString() || '0',
              reps: set.reps?.toString() || '0'
            });
          });
        }
        
        setPreviousWorkoutData(groupedSets);
      } catch (error) {
        console.error("Error fetching previous workout data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreviousWorkoutData();
  }, [routineId, user]);
  
  return {
    previousWorkoutData,
    restTimerSettings,
    isLoading
  };
};
