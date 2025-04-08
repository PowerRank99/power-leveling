
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useWorkoutExercises } from './useWorkoutExercises';

export const useWorkoutInitialization = (
  routineId: string,
  isInitialized: boolean,
  isCreatingWorkout: boolean,
  setIsLoading: (loading: boolean) => void,
  setLoadError: (error: string | null) => void,
  setExercises: (exercises: any[]) => void,
  setWorkoutId: (id: string | null) => void,
  setIsInitialized: (initialized: boolean) => void
) => {
  const navigate = useNavigate();
  const { fetchRoutineExercises } = useWorkoutExercises();

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
      const { workoutExercises, workoutId: newWorkoutId } = await fetchRoutineExercises(routineId);
      
      if (workoutExercises && workoutExercises.length > 0 && newWorkoutId) {
        console.log("Workout setup successful with", workoutExercises.length, "exercises");
        setExercises(workoutExercises);
        setWorkoutId(newWorkoutId);
        setIsInitialized(true);
      } else {
        throw new Error("Não foi possível iniciar o treino. Verifique se a rotina possui exercícios.");
      }
    } catch (error: any) {
      console.error("Error in setupWorkout:", error);
      setLoadError(error.message || "Erro ao iniciar treino");
      
      toast.error("Erro ao carregar treino", {
        description: "Não foi possível iniciar seu treino. Tente novamente."
      });
      
      setTimeout(() => {
        navigate('/treino');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [routineId, fetchRoutineExercises, navigate, isInitialized, isCreatingWorkout, setIsLoading, setLoadError, setExercises, setWorkoutId, setIsInitialized]);

  useEffect(() => {
    if (!isInitialized && !isCreatingWorkout) {
      setupWorkout();
    }
  }, [setupWorkout, isInitialized, isCreatingWorkout]);

  return {
    setupWorkout
  };
};
