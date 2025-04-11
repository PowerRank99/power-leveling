
import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon } from '@/components/icons/NavIcons';
import PageHeader from '@/components/ui/PageHeader';
import ExerciseCard from '@/components/workout/ExerciseCard';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Exercise, ExerciseType } from '@/components/workout/types/Exercise';
import { MUSCLE_GROUP_ALIASES } from '@/components/workout/constants/exerciseFilters';

const ExerciseLibraryPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const categories = [
    'Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio', 'Esportes'
  ];
  
  // Normalize text for comparison by removing accents and converting to lowercase
  const normalizeText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };
  
  // Check if an exercise belongs to a category
  const exerciseMatchesCategory = (exercise: Exercise, category: string): boolean => {
    if (category === 'Todos') return true;
    
    const muscleGroup = exercise.muscle_group || '';
    const normalizedMuscleGroup = normalizeText(muscleGroup);
    const normalizedCategory = normalizeText(category);
    
    // Direct match
    if (normalizedMuscleGroup === normalizedCategory) {
      return true;
    }
    
    // Check aliases
    const matchingAliasKey = Object.keys(MUSCLE_GROUP_ALIASES).find(key => 
      normalizedMuscleGroup.includes(key) && 
      normalizeText(MUSCLE_GROUP_ALIASES[key as keyof typeof MUSCLE_GROUP_ALIASES]) === normalizedCategory
    );
    
    return !!matchingAliasKey;
  };
  
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Process data to ensure type property is a valid ExerciseType
        const processedData = (data || []).map(exercise => ({
          ...exercise,
          type: (exercise.type || 'Força') as ExerciseType
        })) as Exercise[];
        
        // Apply category filter if not 'Todos'
        let filteredData = processedData;
        
        if (activeCategory !== 'Todos') {
          filteredData = filteredData.filter(ex => exerciseMatchesCategory(ex, activeCategory));
        }
        
        setExercises(filteredData);
        
        // Log info for debugging
        console.log(`Fetched ${filteredData.length} exercises for category ${activeCategory}`);
        
        // Log distribution by category
        const categoryCount: Record<string, number> = {};
        filteredData.forEach(ex => {
          const category = ex.muscle_group || 'Não especificado';
          if (categoryCount[category]) {
            categoryCount[category]++;
          } else {
            categoryCount[category] = 1;
          }
        });
        
        console.log('Exercise distribution by category:', categoryCount);
        
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
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader 
        title="Biblioteca de Exercícios" 
        rightContent={<SearchIcon className="w-6 h-6 text-text-secondary" />}
      />
      
      {/* Categories */}
      <div className="px-4 py-3 bg-midnight-card border-b border-divider overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-sora ${
                activeCategory === category
                  ? 'bg-arcane text-text-primary shadow-glow-subtle'
                  : 'bg-midnight-elevated text-text-secondary border border-divider'
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
              category={exercise.muscle_group || 'Não especificado'}
              level={exercise.level as any}
              type={exercise.type as any}
              image={exercise.image_url || '/placeholder.svg'}
              description={exercise.description || ''}
              equipment={exercise.equipment_type || 'Não especificado'}
              muscleGroup={exercise.muscle_group || 'Não especificado'}
              equipmentType={exercise.equipment_type || 'Não especificado'}
            />
          ))
        ) : (
          <EmptyState 
            icon="Search" 
            title="Nenhum exercício encontrado" 
            description={`Nenhum exercício encontrado ${activeCategory !== 'Todos' ? `na categoria ${activeCategory}` : ''}.`} 
          />
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ExerciseLibraryPage;
