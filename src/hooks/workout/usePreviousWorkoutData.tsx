
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PreviousWorkoutData {
  [exerciseId: string]: {
    weight: string;
    reps: string;
    set_order: number; // Add set_order to track exact position
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
        console.log("[PREVIOUS_WORKOUT] Fetching previous workout data for routine:", routineId);
        
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
          console.log("[PREVIOUS_WORKOUT] No previous workout found for routine:", routineId);
          return;
        }
        
        if (!previousWorkout) {
          console.log("[PREVIOUS_WORKOUT] No previous workout found for routine:", routineId);
          return;
        }
        
        console.log("[PREVIOUS_WORKOUT] Found previous workout:", previousWorkout.id);
        
        // Set previous rest timer settings if available
        if (previousWorkout && 
            previousWorkout.rest_timer_minutes !== null && 
            previousWorkout.rest_timer_seconds !== null) {
          console.log(`[PREVIOUS_WORKOUT] Loading previous timer settings: ${previousWorkout.rest_timer_minutes}m ${previousWorkout.rest_timer_seconds}s`);
          setRestTimerSettings({
            minutes: previousWorkout.rest_timer_minutes || 1,
            seconds: previousWorkout.rest_timer_seconds || 30
          });
        }
        
        // 2. Get all completed sets from the previous workout
        const { data: previousSets, error: setsError } = await supabase
          .from('workout_sets')
          .select(`
            id,
            exercise_id,
            weight,
            reps,
            completed,
            set_order
          `)
          .eq('workout_id', previousWorkout.id)
          .eq('completed', true);  // Only get completed sets for reference
          
        if (setsError) {
          console.error("[PREVIOUS_WORKOUT] Error fetching previous workout sets:", setsError);
          return;
        }
        
        if (!previousSets || previousSets.length === 0) {
          console.log("[PREVIOUS_WORKOUT] No completed sets found in previous workout");
          return;
        }
        
        console.log(`[PREVIOUS_WORKOUT] Found ${previousSets.length} completed sets from previous workout`);
        
        // 3. Group sets by exercise ID
        const groupedSets: PreviousWorkoutData = {};
        
        previousSets.forEach(set => {
          if (!set.exercise_id) return;
          
          if (!groupedSets[set.exercise_id]) {
            groupedSets[set.exercise_id] = [];
          }
          
          groupedSets[set.exercise_id].push({
            weight: set.weight?.toString() || '0',
            reps: set.reps?.toString() || '0',
            set_order: set.set_order // Store the set order to preserve position
          });
        });
        
        // Sort sets by set_order to ensure they're in the right order
        Object.keys(groupedSets).forEach(exerciseId => {
          groupedSets[exerciseId].sort((a, b) => a.set_order - b.set_order);
        });
        
        setPreviousWorkoutData(groupedSets);
        console.log("[PREVIOUS_WORKOUT] Processed previous workout data:", Object.keys(groupedSets).length, "exercises");
        console.log("[PREVIOUS_WORKOUT] Previous workout data details:", groupedSets);
      } catch (error) {
        console.error("[PREVIOUS_WORKOUT] Error fetching previous workout data:", error);
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
