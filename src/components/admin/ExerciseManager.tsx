
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ExerciseCard from '@/components/workout/ExerciseCard';
import { Trash2, RefreshCcw } from 'lucide-react';
import { Exercise } from '@/components/workout/types/Exercise';

const ExerciseManager = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
      setExercises(data as Exercise[]);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
      setIsDeleting(id);
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setExercises(exercises.filter(exercise => exercise.id !== id));
        
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

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Exercícios Cadastrados ({exercises.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchExercises}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>
      
      {isLoading ? (
        <LoadingSpinner message="Carregando exercícios..." />
      ) : exercises.length > 0 ? (
        <div className="space-y-3">
          {exercises.map(exercise => (
            <div key={exercise.id} className="relative">
              <ExerciseCard
                name={exercise.name}
                category={exercise.muscle_group || 'Não especificado'}
                level={exercise.level as any}
                type={exercise.type}
                image={exercise.image_url || '/placeholder.svg'}
                description={exercise.description}
                equipment={exercise.equipment_type || 'Não especificado'}
                muscleGroup={exercise.muscle_group || 'Não especificado'}
                equipmentType={exercise.equipment_type || 'Não especificado'}
              />
              <button 
                className={`absolute top-3 right-3 bg-red-100 text-red-600 p-2 rounded-full ${isDeleting === exercise.id ? 'opacity-50' : ''}`}
                onClick={() => handleDelete(exercise.id)}
                disabled={isDeleting === exercise.id}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="Não há exercícios cadastrados"
          description="Use o importador de exercícios para adicionar."
        />
      )}
    </div>
  );
};

export default ExerciseManager;
