
import { useState } from 'react';
import { WorkoutExercise, SetData } from '@/types/workoutTypes';
import { SetService } from '@/services/SetService';
import { toast } from 'sonner';

/**
 * Hook that provides basic set operations with state management
 */
export function useSetOperations(workoutId: string | null) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Safely executes a set operation with proper state management
   */
  const executeOperation = async <T,>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T | null> => {
    // Don't allow multiple operations simultaneously
    if (isProcessing) {
      console.log(`[useSetOperations] Another operation is in progress, skipping ${operationName}`);
      return null;
    }
    
    if (!workoutId) {
      toast.error(`Erro ao ${operationName}`, {
        description: "Treino não encontrado"
      });
      return null;
    }
    
    try {
      setIsProcessing(true);
      return await operation();
    } catch (error) {
      console.error(`[useSetOperations] Error during ${operationName}:`, error);
      toast.error(`Erro ao ${operationName}`, {
        description: "Não foi possível completar a operação"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    executeOperation,
    isProcessing
  };
}
