
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { Exercise } from '@/components/workout/types/Exercise';

export const useRoutineCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: shadcnToast } = useToast();
  const [routineName, setRoutineName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShowingSearch, setIsShowingSearch] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    
    if (!routineName.trim()) {
      toast.error('Nome obrigatório', {
        description: 'Por favor, dê um nome para sua rotina.'
      });
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error('Sem exercícios', {
        description: 'Adicione pelo menos um exercício à rotina.'
      });
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado', {
        description: 'Você precisa estar logado para salvar rotinas.'
      });
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('Creating routine with user ID:', user.id);
      console.log('Routine name:', routineName);
      console.log('Selected exercises:', selectedExercises.length);
      
      // Create the routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineName,
          user_id: user.id,
        })
        .select()
        .single();

      if (routineError) {
        console.error('Error creating routine:', routineError);
        throw routineError;
      }

      console.log('Routine created successfully:', routineData);
      
      if (!routineData || !routineData.id) {
        throw new Error('Failed to retrieve routine ID after creation');
      }

      // Add exercises to the routine
      const routineExercises = selectedExercises.map((exercise, index) => ({
        routine_id: routineData.id,
        exercise_id: exercise.id,
        display_order: index,
        target_sets: 3, // Default values
        target_reps: '12', // Default values
      }));

      console.log('Adding exercises to routine:', routineExercises.length);
      
      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises);

      if (exercisesError) {
        console.error('Error adding exercises to routine:', exercisesError);
        throw exercisesError;
      }

      console.log('Exercises added successfully to routine');
      
      // Show success toast with both libraries for redundancy
      toast.success('Rotina criada com sucesso!', {
        description: 'Sua rotina foi salva.'
      });
      
      shadcnToast({
        title: 'Rotina criada',
        description: 'Sua rotina foi criada com sucesso!',
      });

      // Navigate after a brief delay to ensure toasts are visible
      setTimeout(() => {
        navigate('/treino');
      }, 300);
      
    } catch (error: any) {
      console.error('Error saving routine:', error);
      
      const errorMessage = error.message || 'Erro ao salvar rotina';
      setError(errorMessage);
      
      toast.error('Erro ao criar rotina', {
        description: 'Não foi possível salvar sua rotina. Por favor, tente novamente.'
      });
      
      shadcnToast({
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
    error,
    addExercise,
    removeExercise,
    saveRoutine
  };
};
