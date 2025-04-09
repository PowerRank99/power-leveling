
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AdminExercise } from '../types/exercise';

export const useExerciseFetcher = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data as AdminExercise[]);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: 'Erro ao carregar exercícios',
        description: 'Não foi possível carregar a lista de exercícios.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exercises,
    isLoading,
    fetchExercises
  };
};
