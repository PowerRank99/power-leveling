
import { useState, useEffect } from 'react';
import { useCategoryManagement } from '../CategoryManagement';
import { AdminExercise, ExerciseFilterState } from '../types/exercise';

export const useExerciseFilters = (exercises: AdminExercise[]) => {
  const { getUniqueValues } = useCategoryManagement();
  
  const [filters, setFilters] = useState<ExerciseFilterState>({
    searchQuery: '',
    muscleFilter: '',
    equipmentFilter: '',
  });
  
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);

  useEffect(() => {
    loadCategoryOptions();
  }, []);

  const loadCategoryOptions = async () => {
    const muscleData = await getUniqueValues('muscle_group');
    const equipmentData = await getUniqueValues('equipment_type');
    
    setMuscleGroups(['', ...muscleData.map(item => item.name)]);
    setEquipmentTypes(['', ...equipmentData.map(item => item.name)]);
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      muscleFilter: '',
      equipmentFilter: '',
    });
  };

  const setSearchQuery = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  const setMuscleFilter = (value: string) => {
    setFilters(prev => ({ ...prev, muscleFilter: value }));
  };

  const setEquipmentFilter = (value: string) => {
    setFilters(prev => ({ ...prev, equipmentFilter: value }));
  };

  // Apply filters to exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = filters.searchQuery === '' || 
      exercise.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
    const matchesMuscle = filters.muscleFilter === '' || 
      (exercise.muscle_group && exercise.muscle_group === filters.muscleFilter);
      
    const matchesEquipment = filters.equipmentFilter === '' || 
      (exercise.equipment_type && exercise.equipment_type === filters.equipmentFilter);
      
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return {
    filters,
    muscleGroups,
    equipmentTypes,
    filteredExercises,
    setSearchQuery,
    setMuscleFilter,
    setEquipmentFilter,
    resetFilters
  };
};
