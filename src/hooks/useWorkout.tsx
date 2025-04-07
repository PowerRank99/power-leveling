
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutSets } from './useWorkoutSets';
import { useWorkoutCompletion } from './useWorkoutCompletion';

export { WorkoutExercise } from '@/types/workout';

export const useWorkout = (routineId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { updateSet: updateSetAction, addSet: addSetAction } = useWorkoutSets(workoutId, exercises, currentExerciseIndex);
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);

  useEffect(() => {
    const fetchRoutineAndCreateWorkout = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch routine exercises
        const { data: routineExercises, error: routineError } = await supabase
          .from('routine_exercises')
          .select(`
            id,
            target_sets,
            target_reps,
            display_order,
            exercises (
              id,
              name
            )
          `)
          .eq('routine_id', routineId)
          .order('display_order');
        
        if (routineError) {
          throw routineError;
        }
        
        if (!routineExercises || routineExercises.length === 0) {
          toast({
            title: "Rotina não encontrada",
            description: "Não foi possível encontrar exercícios para esta rotina.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        // 2. Create a new workout
        const { data: newWorkout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            routine_id: routineId,
            started_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (workoutError) {
          throw workoutError;
        }
        
        if (!newWorkout) {
          throw new Error("Failed to create workout");
        }
        
        setWorkoutId(newWorkout.id);
        
        // 3. Format exercises data
        const workoutExercises: WorkoutExercise[] = routineExercises.map(routineExercise => {
          const exercise = routineExercise.exercises;
          const targetSets = routineExercise.target_sets || 3;
          const targetReps = routineExercise.target_reps?.split(',') || ['12'];
          
          // Create sets for this exercise
          const sets = Array.from({ length: targetSets }).map((_, index) => {
            // Use the corresponding rep target if available, otherwise use the last one
            const repTarget = index < targetReps.length ? targetReps[index] : targetReps[targetReps.length - 1];
            
            return {
              id: `${index}`,
              weight: '0',
              reps: repTarget,
              completed: false,
              previous: {
                weight: '0',
                reps: repTarget
              }
            };
          });
          
          return {
            id: exercise.id,
            name: exercise.name,
            sets
          };
        });
        
        setExercises(workoutExercises);
        
        // 4. Create workout_sets entries for each set
        const workoutSetsToInsert = workoutExercises.flatMap((exercise, exerciseIndex) => 
          exercise.sets.map((set, setIndex) => ({
            workout_id: newWorkout.id,
            exercise_id: exercise.id,
            set_order: exerciseIndex * 100 + setIndex, // This gives room for ordering
            reps: parseInt(set.reps),
            weight: parseFloat(set.weight) || 0,
            completed: false
          }))
        );
        
        if (workoutSetsToInsert.length > 0) {
          const { error: setsError } = await supabase
            .from('workout_sets')
            .insert(workoutSetsToInsert);
            
          if (setsError) {
            console.error("Error creating workout sets:", setsError);
          }
        }
        
      } catch (error) {
        console.error("Error setting up workout:", error);
        toast({
          title: "Erro ao iniciar treino",
          description: "Não foi possível iniciar o treino. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoutineAndCreateWorkout();
  }, [routineId, toast]);
  
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
    }
  };
  
  const finishWorkout = async () => {
    return finishWorkoutAction(elapsedTime);
  };
  
  return {
    isLoading,
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
