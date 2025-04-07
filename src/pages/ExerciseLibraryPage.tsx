
import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon } from '@/components/icons/NavIcons';
import PageHeader from '@/components/ui/PageHeader';
import ExerciseCard from '@/components/workout/ExerciseCard';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Exercise } from '@/components/workout/ExerciseSearch';

const ExerciseLibraryPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const categories = [
    'Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Abdômen'
  ];
  
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('exercises').select('*').order('name');
        
        if (activeCategory !== 'Todos') {
          query = query.eq('category', activeCategory);
        }
        
        const { data, error } = await query;
        
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
    
    fetchExercises();
  }, [activeCategory, toast]);
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader 
        title="Biblioteca de Exercícios" 
        rightContent={<SearchIcon className="w-6 h-6" />}
      />
      
      {/* Categories */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-fitblue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Exercise List */}
      <div className="p-4">
        {isLoading ? (
          <LoadingSpinner message="Carregando exercícios..." />
        ) : exercises.length > 0 ? (
          exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              name={exercise.name}
              category={exercise.category}
              level={exercise.level as any}
              type={exercise.type as any}
              image={exercise.image_url || '/placeholder.svg'}
              description={exercise.description}
              equipment={exercise.equipment}
            />
          ))
        ) : (
          <EmptyState message={`Nenhum exercício encontrado ${activeCategory !== 'Todos' ? `na categoria ${activeCategory}` : ''}.`} />
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ExerciseLibraryPage;
