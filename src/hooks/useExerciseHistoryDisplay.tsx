
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExerciseHistory } from '@/types/workout';
import { mapToExerciseHistory } from '@/utils/typeMappers';

export const useExerciseHistoryDisplay = (exerciseId: string) => {
  const [historyData, setHistoryData] = useState<ExerciseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseHistory = async () => {
      if (!exerciseId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('exercise_history')
          .select('*')
          .eq('exercise_id', exerciseId)
          .order('last_used_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Use our mapper to ensure type compatibility
        const formattedData: ExerciseHistory[] = data.map(item => mapToExerciseHistory(item));

        setHistoryData(formattedData);
      } catch (error) {
        console.error('Error fetching exercise history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExerciseHistory();
  }, [exerciseId]);

  return { historyData, isLoading };
};
