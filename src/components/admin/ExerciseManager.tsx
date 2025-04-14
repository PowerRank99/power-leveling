
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise, ExerciseType } from '@/components/workout/types/Exercise';
import ExerciseManagerHeader from './exercise-manager/ExerciseManagerHeader';
import ExerciseSearch from './exercise-manager/ExerciseSearch';
import ExerciseList from './exercise-manager/ExerciseList';
import DeleteConfirmationDialog from './exercise-manager/DeleteConfirmationDialog';
import { useExerciseSearch } from './exercise-manager/useExerciseSearch';

const ExerciseManager = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  
  const { searchTerm, setSearchTerm, filteredExercises } = useExerciseSearch(exercises);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Ensure all exercises have valid type
      const processedData = (data || []).map(exercise => ({
        ...exercise,
        type: (exercise.type || 'Musculação') as ExerciseType
      }));
      
      setExercises(processedData as Exercise[]);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: 'Erro ao carregar exercícios',
        description: 'Não foi possível carregar a lista de exercícios.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setExerciseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!exerciseToDelete) return;
    
    setIsDeleting(exerciseToDelete);
    setShowDeleteConfirm(false);
    
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseToDelete);

      if (error) throw error;
      
      setExercises(exercises.filter(exercise => exercise.id !== exerciseToDelete));
      
      toast({
        title: 'Exercício excluído',
        description: 'O exercício foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: 'Erro ao excluir exercício',
        description: 'Não foi possível excluir o exercício.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(null);
      setExerciseToDelete(null);
    }
  };

  const handleExerciseUpdate = (updatedExercise: Exercise) => {
    setExercises(prevExercises => 
      prevExercises.map(ex => 
        ex.id === updatedExercise.id ? updatedExercise : ex
      )
    );
  };

  return (
    <div className="mb-6">
      <ExerciseManagerHeader 
        exerciseCount={filteredExercises.length}
        onRefresh={fetchExercises}
      />
      
      <ExerciseSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <ExerciseList 
        exercises={filteredExercises}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onConfirmDelete={confirmDelete}
        onUpdate={handleExerciseUpdate}
      />

      <DeleteConfirmationDialog 
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ExerciseManager;
