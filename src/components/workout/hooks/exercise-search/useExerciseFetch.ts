
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '../../types/Exercise';

export const useExerciseFetch = (selectedExerciseIds: string[]) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const exercises = data?.filter(ex => !selectedExerciseIds.includes(ex.id)) || [];
      
      console.log('Fetched exercises:', exercises.length);
      
      // Log the actual muscle_group and equipment_type values from the database for debugging
      const uniqueMuscleGroups = [...new Set(exercises.map(ex => ex.muscle_group))].filter(Boolean);
      const uniqueEquipmentTypes = [...new Set(exercises.map(ex => ex.equipment_type))].filter(Boolean);
      
      console.log('Unique muscle groups in DB:', uniqueMuscleGroups);
      console.log('Unique equipment types in DB:', uniqueEquipmentTypes);
      
      // Process exercises to normalize values for comparison
      const processedExercises = exercises.map(ex => ({
        ...ex,
        muscle_group: ex.muscle_group || ex.category || 'Não especificado',
        equipment_type: ex.equipment_type || 'Não especificado'
      }));
      
      setAvailableExercises(processedExercises as Exercise[]);
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
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    availableExercises,
    recentExercises,
    fetchExercises
  };
};
