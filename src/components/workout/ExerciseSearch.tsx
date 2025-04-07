
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ExerciseCard from './ExerciseCard';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  level: string;
  type: string;
  image_url?: string;
}

interface ExerciseSearchProps {
  selectedExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  selectedExercises,
  onAddExercise,
  onClose,
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to search for exercises
  const searchExercises = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .order('name');
      
      if (error) throw error;
      
      // Filter out exercises already selected
      const selectedIds = selectedExercises.map(ex => ex.id);
      const filteredExercises = data?.filter(ex => !selectedIds.includes(ex.id)) || [];
      
      setAvailableExercises(filteredExercises as Exercise[]);
    } catch (error) {
      console.error('Error searching exercises:', error);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível buscar exercícios. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex gap-2 mb-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar exercícios..."
          className="flex-1"
        />
        <Button 
          onClick={searchExercises}
          disabled={isLoading}
        >
          Buscar
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-3 border-fitblue border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Buscando exercícios...</p>
        </div>
      ) : (
        <div>
          {availableExercises.length > 0 ? (
            availableExercises.map(exercise => (
              <div 
                key={exercise.id} 
                className="cursor-pointer" 
                onClick={() => onAddExercise(exercise)}
              >
                <ExerciseCard
                  name={exercise.name}
                  category={exercise.category}
                  level={exercise.level as any}
                  type={exercise.type as any}
                  image={exercise.image_url || '/placeholder.svg'}
                />
              </div>
            ))
          ) : (
            searchQuery ? (
              <p className="text-center py-4 text-gray-500">
                Nenhum exercício encontrado. Tente outra busca.
              </p>
            ) : (
              <p className="text-center py-4 text-gray-500">
                Digite um nome de exercício para buscar.
              </p>
            )
          )}
        </div>
      )}

      <Button 
        variant="outline" 
        className="w-full mt-3"
        onClick={onClose}
      >
        Fechar Busca
      </Button>
    </div>
  );
};

export default ExerciseSearch;
