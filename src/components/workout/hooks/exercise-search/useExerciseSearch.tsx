
import { useState, useEffect } from 'react';
import { Exercise } from '../../types/Exercise';
import { UseExerciseSearchProps, ExerciseSearchResult } from './types';
import { useExerciseFetch } from './useExerciseFetch';
import { applyFilters } from './useExerciseFilters';
import { EQUIPMENT_TYPES } from '../../constants/exerciseFilters';

// Filter out specific equipment types for the routine creation page
export const FILTERED_EQUIPMENT_TYPES = EQUIPMENT_TYPES.filter(type => 
  !['Barra de Cardio', 'Equipamento de Esportes', 'Barra', 'Banco', 'TRX', 'Cabo'].includes(type)
);

export const useExerciseSearch = ({ selectedExercises, maxResults }: UseExerciseSearchProps): ExerciseSearchResult => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState('Todos');
  const [muscleFilter, setMuscleFilter] = useState('Todos');
  
  // Debugging state
  const [debugInfo, setDebugInfo] = useState({
    totalExercises: 0,
    afterEquipmentFilter: 0,
    afterMuscleFilter: 0,
    finalFiltered: 0
  });

  // Get selected exercise IDs for filtering
  const selectedIds = selectedExercises.map(ex => ex.id);
  
  // Use our fetch hook
  const { 
    isLoading, 
    availableExercises, 
    recentExercises, 
    fetchExercises 
  } = useExerciseFetch(selectedIds);

  // Fetch exercises on initial load or when selection changes
  useEffect(() => {
    const loadExercises = async () => {
      const result = await fetchExercises();
      setDebugInfo(prev => ({ ...prev, totalExercises: result.totalCount }));
      updateFilteredExercises(result.exercises);
    };
    
    loadExercises();
  }, [selectedExercises]);

  // Update filtered exercises whenever filters or available exercises change
  useEffect(() => {
    updateFilteredExercises(availableExercises);
  }, [searchQuery, equipmentFilter, muscleFilter, availableExercises]);

  // Apply filters and update state
  const updateFilteredExercises = (exercises: Exercise[]) => {
    const filtered = applyFilters(exercises, searchQuery, equipmentFilter, muscleFilter);
    
    // Apply maxResults limit if provided
    const limitedResults = maxResults ? filtered.slice(0, maxResults) : filtered;
    
    setFilteredExercises(limitedResults);
    
    // Update debug info
    setDebugInfo(prev => ({
      ...prev,
      afterEquipmentFilter: equipmentFilter !== 'Todos' ? filtered.length : prev.afterEquipmentFilter,
      afterMuscleFilter: muscleFilter !== 'Todos' ? filtered.length : prev.afterMuscleFilter,
      finalFiltered: limitedResults.length
    }));
    
    console.log('Final filtered exercises:', limitedResults.length);
    
    // Log sample exercises for debugging
    if (limitedResults.length > 0 && limitedResults.length < 10) {
      limitedResults.forEach(ex => {
        console.log(`Exercise: ${ex.name}, Muscle: "${ex.muscle_group}", Equipment: "${ex.equipment_type}"`);
      });
    }
  };

  // Handler for search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Reset all filters
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
    availableExercises,
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
