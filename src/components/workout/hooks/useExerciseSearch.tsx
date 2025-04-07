
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '../types/Exercise';
import { MUSCLE_GROUP_ALIASES, EQUIPMENT_TYPE_ALIASES } from '../constants/exerciseFilters';

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

  // Debugging state to track filter changes
  const [debugInfo, setDebugInfo] = useState({
    totalExercises: 0,
    afterEquipmentFilter: 0,
    afterMuscleFilter: 0,
    finalFiltered: 0
  });

  useEffect(() => {
    fetchExercises();
  }, [selectedExercises]);

  useEffect(() => {
    if (availableExercises.length > 0) {
      filterExercises();
    }
  }, [equipmentFilter, muscleFilter, availableExercises, searchQuery]);

  // Normalize text for comparison by removing accents and converting to lowercase
  const normalizeText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Check if an exercise matches the given filter and value
  const matchesFilter = (exercise: Exercise, filterType: 'muscle_group' | 'equipment_type', filterValue: string): boolean => {
    if (filterValue === 'Todos') return true;
    
    const exerciseValue = filterType === 'muscle_group' 
      ? (exercise.muscle_group || exercise.category || '')
      : (exercise.equipment_type || exercise.equipment || '');
    
    const normalizedExerciseValue = normalizeText(exerciseValue);
    const normalizedFilterValue = normalizeText(filterValue);
    
    // Direct match
    if (normalizedExerciseValue === normalizedFilterValue) {
      return true;
    }
    
    // Check aliases for muscle groups
    if (filterType === 'muscle_group') {
      // Check if exercise value matches any key in the aliases map that maps to our filter value
      const matchingAliasKey = Object.keys(MUSCLE_GROUP_ALIASES).find(key => 
        normalizedExerciseValue.includes(key) && 
        normalizeText(MUSCLE_GROUP_ALIASES[key as keyof typeof MUSCLE_GROUP_ALIASES]) === normalizedFilterValue
      );
      
      if (matchingAliasKey) return true;
      
      // Special case for 'Não especificado'
      if (filterValue === 'Não especificado' && (!exercise.muscle_group || exercise.muscle_group.trim() === '')) {
        return true;
      }

      // Check if category matches (for backward compatibility)
      if (normalizeText(exercise.category) === normalizedFilterValue) {
        return true;
      }
    }
    
    // Check aliases for equipment types
    if (filterType === 'equipment_type') {
      // Check if exercise value matches any key in the aliases map that maps to our filter value
      const matchingAliasKey = Object.keys(EQUIPMENT_TYPE_ALIASES).find(key => 
        normalizedExerciseValue.includes(key) && 
        normalizeText(EQUIPMENT_TYPE_ALIASES[key as keyof typeof EQUIPMENT_TYPE_ALIASES]) === normalizedFilterValue
      );
      
      if (matchingAliasKey) return true;
      
      // Special case for 'Nenhum' (bodyweight exercises)
      if (filterValue === 'Nenhum' && (!exercise.equipment_type || exercise.equipment_type.trim() === '' || 
          !exercise.equipment || exercise.equipment.trim() === '')) {
        return true;
      }
      
      // Special case for 'Não especificado'
      if (filterValue === 'Não especificado' && (!exercise.equipment_type || exercise.equipment_type.trim() === '')) {
        return true;
      }
    }
    
    return false;
  };

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
      
      // Log the actual muscle_group and equipment_type values from the database for debugging
      const uniqueMuscleGroups = [...new Set(exercises.map(ex => ex.muscle_group))].filter(Boolean);
      const uniqueEquipmentTypes = [...new Set(exercises.map(ex => ex.equipment_type))].filter(Boolean);
      
      console.log('Unique muscle groups in DB:', uniqueMuscleGroups);
      console.log('Unique equipment types in DB:', uniqueEquipmentTypes);
      
      // Process exercises to normalize values for comparison
      const processedExercises = exercises.map(ex => ({
        ...ex,
        muscle_group: ex.muscle_group || ex.category || 'Não especificado',
        equipment_type: ex.equipment_type || 'Não especificado'
      }));
      
      setAvailableExercises(processedExercises as Exercise[]);
      setFilteredExercises(processedExercises as Exercise[]);
      setDebugInfo(prev => ({ ...prev, totalExercises: processedExercises.length }));
      
      setRecentExercises(processedExercises.slice(0, 5) as Exercise[]);
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
    console.log('Starting filter with', filtered.length, 'exercises');
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex => 
        normalizeText(ex.name).includes(normalizeText(searchQuery))
      );
      console.log('After search filter:', filtered.length, 'exercises');
    }
    
    if (equipmentFilter !== 'Todos') {
      console.log('Filtering by equipment:', equipmentFilter);
      
      filtered = filtered.filter(ex => matchesFilter(ex, 'equipment_type', equipmentFilter));
      
      console.log('After equipment filter:', filtered.length, 'exercises remaining');
      setDebugInfo(prev => ({ ...prev, afterEquipmentFilter: filtered.length }));
    }
    
    if (muscleFilter !== 'Todos') {
      console.log('Filtering by muscle:', muscleFilter);
      
      filtered = filtered.filter(ex => matchesFilter(ex, 'muscle_group', muscleFilter));
      
      console.log('After muscle filter:', filtered.length, 'exercises remaining');
      setDebugInfo(prev => ({ ...prev, afterMuscleFilter: filtered.length }));
    }
    
    setFilteredExercises(filtered);
    setDebugInfo(prev => ({ ...prev, finalFiltered: filtered.length }));
    console.log('Final filtered exercises:', filtered.length);
    
    // Log sample exercises for debugging
    if (filtered.length > 0 && filtered.length < 10) {
      filtered.forEach(ex => {
        console.log(`Exercise: ${ex.name}, Muscle: "${ex.muscle_group}", Equipment: "${ex.equipment_type}"`);
      });
    }
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
    hasActiveFilters,
    debugInfo
  };
};
