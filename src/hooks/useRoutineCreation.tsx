
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '@/components/workout/ExerciseSearch';

export const useRoutineCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [routineName, setRoutineName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShowingSearch, setIsShowingSearch] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add exercise to routine
  const addExercise = (exercise: Exercise) => {
    setSelectedExercises([...selectedExercises, exercise]);
    setAvailableExercises(availableExercises.filter(ex => ex.id !== exercise.id));
  };

  // Remove exercise from routine
  const removeExercise = (index: number) => {
    const removed = selectedExercises[index];
    const newSelected = [...selectedExercises];
    newSelected.splice(index, 1);
    setSelectedExercises(newSelected);
    
    // Add back to available exercises if it was from search results
    if (availableExercises.findIndex(ex => ex.id === removed.id) === -1) {
      setAvailableExercises([...availableExercises, removed]);
    }
  };

  // Create the routine
  const saveRoutine = async () => {
    if (!routineName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, dê um nome para sua rotina.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedExercises.length === 0) {
      toast({
        title: 'Sem exercícios',
        description: 'Adicione pelo menos um exercício à rotina.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Create the routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineName,
          user_id: user?.id,
        })
        .select()
        .single();

      if (routineError) throw routineError;

      // Add exercises to the routine
      const routineExercises = selectedExercises.map((exercise, index) => ({
        routine_id: routineData.id,
        exercise_id: exercise.id,
        display_order: index,
        target_sets: 3, // Default values
        target_reps: '12', // Default values
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises);

      if (exercisesError) throw exercisesError;

      toast({
        title: 'Rotina criada',
        description: 'Sua rotina foi criada com sucesso!',
      });

      navigate('/treino');
    } catch (error) {
      console.error('Error creating routine:', error);
      toast({
        title: 'Erro ao criar rotina',
        description: 'Não foi possível salvar sua rotina. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    routineName,
    setRoutineName,
    searchQuery,
    setSearchQuery,
    isShowingSearch,
    setIsShowingSearch,
    selectedExercises,
    setSelectedExercises,
    availableExercises,
    setAvailableExercises,
    isLoading,
    setIsLoading,
    isSaving,
    addExercise,
    removeExercise,
    saveRoutine
  };
};
