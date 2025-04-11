
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '../../types/Exercise';

// Cache for exercises to prevent redundant fetches
const exerciseCache: { exercises: Exercise[], timestamp: number } = {
  exercises: [],
  timestamp: 0
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export const useExerciseFetch = (selectedExerciseIds: string[]) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let exercises: Exercise[] = [];
      
      // Use cached data if available and fresh
      const now = Date.now();
      if (exerciseCache.exercises.length > 0 && (now - exerciseCache.timestamp) < CACHE_EXPIRATION) {
        console.log('Using cached exercises data');
        exercises = exerciseCache.exercises;
      } else {
        console.log('Fetching fresh exercises data');
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        exercises = data || [];
        
        // Update cache
        exerciseCache.exercises = exercises;
        exerciseCache.timestamp = now;
      }
      
      // Filter out selected exercises
      const filteredExercises = exercises.filter(ex => !selectedExerciseIds.includes(ex.id));
      
      console.log('Filtered exercises:', filteredExercises.length);
      
      // Process exercises to normalize values for comparison
      const processedExercises = filteredExercises.map(ex => ({
        ...ex,
        muscle_group: ex.muscle_group || 'Não especificado',
        equipment_type: ex.equipment_type || 'Não especificado'
      }));
      
      setAvailableExercises(processedExercises as Exercise[]);
      
      // Just get 5 for recent exercises
      setRecentExercises((processedExercises.slice(0, 5)) as Exercise[]);
      
      return {
        exercises: processedExercises as Exercise[],
        totalCount: processedExercises.length
      };
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível buscar exercícios. Tente novamente.',
        variant: 'destructive',
      });
      return {
        exercises: [] as Exercise[],
        totalCount: 0
      };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300); // Add a minimum loading time to prevent flickering
    }
  }, [selectedExerciseIds, toast]);

  return {
    isLoading,
    availableExercises,
    recentExercises,
    fetchExercises
  };
};
