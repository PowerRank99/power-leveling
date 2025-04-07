
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

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
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserRoutines = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch routines
        const { data: routines, error: routinesError } = await supabase
          .from('routines')
          .select('id, name, last_used_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (routinesError) throw routinesError;
        
        if (routines && routines.length > 0) {
          const routinesWithCounts = await Promise.all(routines.map(async (routine) => {
            const { count, error } = await supabase
              .from('routine_exercises')
              .select('*', { count: 'exact', head: true })
              .eq('routine_id', routine.id);
              
            return {
              ...routine,
              exercises_count: count || 0
            };
          }));
          
          setSavedRoutines(routinesWithCounts);
        }
        
        // Fetch recent workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('id, started_at, completed_at, duration_seconds, routine_id')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(5);
        
        if (workoutsError) throw workoutsError;
        
        if (workouts && workouts.length > 0) {
          const workoutsWithDetails = await Promise.all(workouts.map(async (workout) => {
            let routineName = 'Treino sem nome';
            if (workout.routine_id) {
              const { data: routineData } = await supabase
                .from('routines')
                .select('name')
                .eq('id', workout.routine_id)
                .single();
                
              if (routineData) {
                routineName = routineData.name;
              }
            }
            
            const { count: setsCount } = await supabase
              .from('workout_sets')
              .select('*', { count: 'exact', head: true })
              .eq('workout_id', workout.id);
              
            const { data: exercisesData } = await supabase
              .from('workout_sets')
              .select('exercise_id')
              .eq('workout_id', workout.id);
              
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
              date: new Date(workout.started_at).toLocaleDateString('pt-BR'),
              exercises_count: uniqueExercises.size,
              sets_count: setsCount || 0,
              prs: 0,
              duration_seconds: workout.duration_seconds,
            };
          }));
          
          setRecentWorkouts(workoutsWithDetails);
        }
      } catch (error) {
        console.error('Error fetching workout data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar seus treinos. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRoutines();
  }, [user, toast]);

  return {
    savedRoutines,
    recentWorkouts,
    isLoading
  };
};
