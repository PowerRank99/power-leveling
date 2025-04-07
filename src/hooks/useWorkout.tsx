
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: Array<{
    id: string;
    weight: string;
    reps: string;
    completed: boolean;
    previous?: {
      weight: string;
      reps: string;
    }
  }>;
}

export const useWorkout = (routineId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();

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
    
    // Start the timer
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [routineId, toast, startTime]);
  
  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = currentExerciseIndex < exercises.length - 1 
    ? exercises[currentExerciseIndex + 1] 
    : null;
  
  const updateSet = async (setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    if (!workoutId || !currentExercise) return;
    
    try {
      // Update local state
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[currentExerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data
      };
      
      updatedExercises[currentExerciseIndex].sets = updatedSets;
      setExercises(updatedExercises);
      
      // Update in database
      const setData: Record<string, any> = {};
      if (data.weight !== undefined) setData.weight = parseFloat(data.weight) || 0;
      if (data.reps !== undefined) setData.reps = parseInt(data.reps) || 0;
      if (data.completed !== undefined) {
        setData.completed = data.completed;
        if (data.completed) {
          setData.completed_at = new Date().toISOString();
        } else {
          setData.completed_at = null;
        }
      }
      
      const { error } = await supabase
        .from('workout_sets')
        .update(setData)
        .eq('workout_id', workoutId)
        .eq('exercise_id', currentExercise.id)
        .eq('set_order', currentExerciseIndex * 100 + setIndex);
        
      if (error) {
        console.error("Error updating set:", error);
      }
      
    } catch (error) {
      console.error("Error updating set:", error);
    }
  };
  
  const addSet = async () => {
    if (!workoutId || !currentExercise) return;
    
    try {
      // Add to local state first
      const updatedExercises = [...exercises];
      const lastSet = updatedExercises[currentExerciseIndex].sets[
        updatedExercises[currentExerciseIndex].sets.length - 1
      ];
      
      const newSet = {
        id: `${updatedExercises[currentExerciseIndex].sets.length}`,
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false,
        previous: lastSet.previous
      };
      
      updatedExercises[currentExerciseIndex].sets.push(newSet);
      setExercises(updatedExercises);
      
      // Add to database
      const newSetOrder = currentExerciseIndex * 100 + updatedExercises[currentExerciseIndex].sets.length - 1;
      
      const { error } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workoutId,
          exercise_id: currentExercise.id,
          set_order: newSetOrder,
          weight: parseFloat(newSet.weight) || 0,
          reps: parseInt(newSet.reps) || 0,
          completed: false
        });
        
      if (error) {
        console.error("Error adding new set:", error);
      }
      
    } catch (error) {
      console.error("Error adding set:", error);
    }
  };
  
  const goToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };
  
  const finishWorkout = async () => {
    if (!workoutId) return false;
    
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        console.error("Error finishing workout:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error finishing workout:", error);
      return false;
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
