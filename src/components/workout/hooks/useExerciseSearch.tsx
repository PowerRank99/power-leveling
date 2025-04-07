
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '../types/Exercise';

interface UseExerciseSearchProps {
  selectedExercises: Exercise[];
}

export const useExerciseSearch = ({ selectedExercises }: UseExerciseSearchProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState('Todos');
  const [muscleFilter, setMuscleFilter] = useState('Todos');
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    fetchExercises();
  }, [selectedExercises]);

  useEffect(() => {
    if (availableExercises.length > 0) {
      filterExercises();
    }
  }, [equipmentFilter, muscleFilter, availableExercises, searchQuery]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const selectedIds = selectedExercises.map(ex => ex.id);
      const exercises = data?.filter(ex => !selectedIds.includes(ex.id)) || [];
      
      console.log('Fetched exercises:', exercises.length);
      console.log('Sample exercise data:', exercises.length > 0 ? exercises[0] : 'No exercises');
      
      setAvailableExercises(exercises as Exercise[]);
      setFilteredExercises(exercises as Exercise[]);
      
      setRecentExercises(exercises.slice(0, 5) as Exercise[]);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível buscar exercícios. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...availableExercises];
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (equipmentFilter !== 'Todos') {
      console.log('Filtering by equipment:', equipmentFilter);
      console.log('Available equipment_types:', [...new Set(availableExercises.map(ex => ex.equipment_type))]);
      filtered = filtered.filter(ex => 
        ex.equipment_type === equipmentFilter
      );
    }
    
    if (muscleFilter !== 'Todos') {
      console.log('Filtering by muscle:', muscleFilter);
      console.log('Available muscle_groups:', [...new Set(availableExercises.map(ex => ex.muscle_group))]);
      console.log('Filtered before muscle filter:', filtered.length);
      
      filtered = filtered.filter(ex => {
        const result = ex.muscle_group === muscleFilter;
        if (!result) {
          console.log(`Exercise ${ex.name} has muscle_group ${ex.muscle_group}, doesn't match ${muscleFilter}`);
        }
        return result;
      });
      
      console.log('Filtered after muscle filter:', filtered.length);
    }
    
    setFilteredExercises(filtered);
    console.log('Final filtered exercises:', filtered.length);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const resetFilters = () => {
    setEquipmentFilter('Todos');
    setMuscleFilter('Todos');
    setSearchQuery('');
  };

  const hasActiveFilters = equipmentFilter !== 'Todos' || muscleFilter !== 'Todos' || searchQuery.trim() !== '';

  return {
    searchQuery,
    setSearchQuery,
    filteredExercises,
    isLoading,
    equipmentFilter,
    setEquipmentFilter,
    muscleFilter,
    setMuscleFilter,
    recentExercises,
    handleSearchChange,
    resetFilters,
    hasActiveFilters
  };
};
