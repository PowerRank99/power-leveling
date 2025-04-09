
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AdminExercise } from '../types/exercise';

export const useExerciseSelection = (exercises: AdminExercise[], onExercisesChanged: () => void) => {
  const { toast } = useToast();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const toggleExerciseSelection = (id: string) => {
    setSelectedExercises(prev => 
      prev.includes(id) ? prev.filter(exId => exId !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = (filteredExercises: AdminExercise[]) => {
    if (selectedExercises.length === filteredExercises.length) {
      setSelectedExercises([]);
    } else {
      setSelectedExercises(filteredExercises.map(ex => ex.id));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
      setIsDeleting(id);
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        onExercisesChanged();
        
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
      }
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedExercises.length === 0) return;
    
    if (window.confirm(`Tem certeza que deseja excluir ${selectedExercises.length} exercício(s)?`)) {
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .in('id', selectedExercises);

        if (error) throw error;
        
        onExercisesChanged();
        setSelectedExercises([]);
        
        toast({
          title: 'Exercícios excluídos',
          description: `${selectedExercises.length} exercício(s) foram excluídos com sucesso.`,
        });
      } catch (error) {
        console.error('Error deleting multiple exercises:', error);
        toast({
          title: 'Erro ao excluir exercícios',
          description: 'Não foi possível excluir os exercícios selecionados.',
          variant: 'destructive'
        });
      }
    }
  };

  return {
    selectedExercises,
    isDeleting,
    toggleExerciseSelection,
    toggleSelectAll,
    handleDelete,
    handleDeleteSelected
  };
};
