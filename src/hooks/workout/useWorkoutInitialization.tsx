
import { useState, useCallback } from 'react';
import { useWorkoutExercises } from '../useWorkoutExercises';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Hook responsible for workout initialization
 */
export const useWorkoutInitialization = (routineId: string) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { fetchRoutineExercises, isCreatingWorkout } = useWorkoutExercises();
  
  const setupWorkout = useCallback(async () => {
    if (!routineId) {
      setLoadError("ID da rotina não fornecido");
      setIsLoading(false);
      return;
    }

    if (isInitialized || isCreatingWorkout) {
      console.log("Workout already initialized or in progress, skipping setup");
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log("Setting up workout for routine:", routineId);
      const result = await fetchRoutineExercises(routineId);
      
      if (result && result.workoutExercises && result.workoutExercises.length > 0 && result.workoutId) {
        console.log("Workout setup successful with", result.workoutExercises.length, "exercises");
        setExercises(result.workoutExercises);
        setWorkoutId(result.workoutId);
        setIsInitialized(true);
      } else {
        throw new Error("Não foi possível iniciar o treino. Verifique se a rotina possui exercícios.");
      }
    } catch (error: any) {
      console.error("Error in setupWorkout:", error);
      setLoadError(error.message || "Erro ao iniciar treino");
      
      toast.error("Erro ao carregar treino", {
        description: error.message || "Não foi possível iniciar seu treino. Tente novamente."
      });
      
      // Redirect to the workout listing page after error
      setTimeout(() => {
        navigate('/treino');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [routineId, fetchRoutineExercises, navigate, isInitialized, isCreatingWorkout]);
  
  return {
    isLoading,
    loadError,
    exercises,
    workoutId,
    isInitialized,
    setupWorkout,
    setExercises
  };
};
