
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutSets } from './useWorkoutSets';
import { useWorkoutCompletion } from './useWorkoutCompletion';
import { useWorkoutExercises } from './useWorkoutExercises';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export type { WorkoutExercise } from '@/types/workout';

export const useWorkout = (routineId: string) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { updateSet: updateSetAction, addSet: addSetAction } = useWorkoutSets(workoutId, exercises, currentExerciseIndex);
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);
  const { fetchRoutineExercises } = useWorkoutExercises();

  useEffect(() => {
    const setupWorkout = async () => {
      if (!routineId) {
        setLoadError("ID da rotina não fornecido");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        
        console.log("Setting up workout for routine:", routineId);
        const { workoutExercises, workoutId: newWorkoutId } = await fetchRoutineExercises(routineId);
        
        if (workoutExercises && newWorkoutId) {
          console.log("Workout setup successful with", workoutExercises.length, "exercises");
          setExercises(workoutExercises);
          setWorkoutId(newWorkoutId);
        } else {
          throw new Error("Não foi possível iniciar o treino. Verifique se a rotina possui exercícios.");
        }
      } catch (error: any) {
        console.error("Error in setupWorkout:", error);
        setLoadError(error.message || "Erro ao iniciar treino");
        
        toast.error("Erro ao carregar treino", {
          description: "Não foi possível iniciar seu treino. Tente novamente."
        });
        
        // Redirect back to workout page after error
        setTimeout(() => {
          navigate('/treino');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    setupWorkout();
  }, [routineId, fetchRoutineExercises, navigate]);
  
  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = currentExerciseIndex < exercises.length - 1 
    ? exercises[currentExerciseIndex + 1] 
    : null;
  
  const updateSet = async (setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    const updatedExercises = await updateSetAction(setIndex, data);
    if (updatedExercises) {
      setExercises(updatedExercises);
    }
  };
  
  const addSet = async () => {
    const updatedExercises = await addSetAction();
    if (updatedExercises) {
      setExercises(updatedExercises);
    }
  };
  
  const goToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      toast.success("Próximo exercício", {
        description: "Avançou para o próximo exercício"
      });
    }
  };
  
  const finishWorkout = async () => {
    const success = await finishWorkoutAction(elapsedTime);
    if (success) {
      toast.success("Treino finalizado!", {
        description: "Seu treino foi salvo com sucesso."
      });
    }
    return success;
  };
  
  return {
    isLoading,
    loadError,
    exercises,
    currentExercise,
    nextExercise,
    currentExerciseIndex,
    totalExercises: exercises.length,
    updateSet,
    addSet,
    goToNextExercise,
    finishWorkout,
    elapsedTime,
    formatTime
  };
};
