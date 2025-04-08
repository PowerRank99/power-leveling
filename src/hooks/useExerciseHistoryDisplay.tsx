
import { useState, useEffect } from 'react';
import { ExerciseHistoryService } from '@/services/ExerciseHistoryService';
import { ExerciseHistory } from '@/types/workoutTypes';

/**
 * Hook for displaying exercise history to users
 */
export function useExerciseHistoryDisplay(exerciseId?: string) {
  const [history, setHistory] = useState<ExerciseHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!exerciseId) return;
    
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const historyData = await ExerciseHistoryService.getExerciseHistory(exerciseId);
        if (historyData) {
          setHistory(historyData as ExerciseHistory);
        }
      } catch (err) {
        console.error("Error fetching exercise history:", err);
        setError("Não foi possível carregar o histórico deste exercício");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [exerciseId]);
  
  // Format the history for display
  const formatHistory = () => {
    if (!history) return null;
    
    return {
      lastUsed: new Date(history.last_used_at).toLocaleDateString(),
      maxWeight: `${history.weight} kg`,
      typicalReps: history.reps,
      typicalSets: history.sets
    };
  };
  
  return {
    history: formatHistory(),
    isLoading,
    error
  };
}
