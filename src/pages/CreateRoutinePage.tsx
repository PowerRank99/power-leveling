
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ExerciseCard from '@/components/workout/ExerciseCard';
import BottomNavBar from '@/components/navigation/BottomNavBar';

interface Exercise {
  id: string;
  name: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  type: 'Composto' | 'Isolado';
  image_url?: string;
}

const CreateRoutinePage: React.FC = () => {
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
      
      setAvailableExercises(filteredExercises.map(ex => ({
        ...ex,
        image: ex.image_url || '/placeholder.svg',
      })));
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

  return (
    <div className="pb-20">
      <PageHeader title="Criar Rotina" />

      <div className="p-4">
        <Input
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Nome da rotina (ex: Treino A - Peito e Tríceps)"
          className="mb-4"
        />

        {/* List of selected exercises */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Exercícios ({selectedExercises.length})</h2>
          
          {selectedExercises.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              Nenhum exercício adicionado ainda
            </div>
          ) : (
            selectedExercises.map((exercise, index) => (
              <div key={exercise.id} className="relative mb-3">
                <ExerciseCard
                  name={exercise.name}
                  category={exercise.category}
                  level={exercise.level}
                  type={exercise.type}
                  image={exercise.image_url || '/placeholder.svg'}
                />
                <button 
                  className="absolute top-3 right-3 bg-red-100 text-red-600 p-2 rounded-full"
                  onClick={() => removeExercise(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add exercises */}
        {isShowingSearch ? (
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
                      onClick={() => addExercise(exercise)}
                    >
                      <ExerciseCard
                        name={exercise.name}
                        category={exercise.category}
                        level={exercise.level}
                        type={exercise.type}
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
              onClick={() => setIsShowingSearch(false)}
            >
              Fechar Busca
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => setIsShowingSearch(true)} 
            className="w-full mb-4 bg-fitblue-100 text-fitblue hover:bg-fitblue-200 border-none"
          >
            <Plus className="w-5 h-5 mr-2" /> Adicionar Exercício
          </Button>
        )}

        {/* Save routine button */}
        <Button 
          className="w-full bg-fitblue"
          onClick={saveRoutine}
          disabled={isSaving || routineName.trim() === '' || selectedExercises.length === 0}
        >
          {isSaving ? 'Salvando...' : 'Salvar Rotina'}
        </Button>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default CreateRoutinePage;
