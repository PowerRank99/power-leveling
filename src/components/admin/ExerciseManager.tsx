
import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useExerciseFetcher } from './hooks/useExerciseFetcher';
import { useExerciseFilters } from './hooks/useExerciseFilters';
import { useExerciseSelection } from './hooks/useExerciseSelection';
import ExerciseListActions from './ExerciseListActions';
import ExerciseList from './ExerciseList';

const ExerciseManager = () => {
  const { exercises, isLoading, fetchExercises } = useExerciseFetcher();
  
  const { 
    filters, 
    muscleGroups, 
    equipmentTypes, 
    filteredExercises, 
    setSearchQuery, 
    setMuscleFilter, 
    setEquipmentFilter,
    resetFilters
  } = useExerciseFilters(exercises);
  
  const { 
    selectedExercises, 
    isDeleting, 
    toggleExerciseSelection, 
    toggleSelectAll, 
    handleDelete,
    handleDeleteSelected
  } = useExerciseSelection(exercises, fetchExercises);

  return (
    <div className="mb-6">
      <ExerciseListActions
        totalCount={exercises.length}
        filteredCount={filteredExercises.length}
        selectedExercises={selectedExercises}
        filteredExercises={filteredExercises}
        onToggleSelectAll={toggleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        onRefresh={fetchExercises}
        searchQuery={filters.searchQuery}
        muscleFilter={filters.muscleFilter}
        equipmentFilter={filters.equipmentFilter}
        muscleGroups={muscleGroups}
        equipmentTypes={equipmentTypes}
        onSearchQueryChange={setSearchQuery}
        onMuscleFilterChange={setMuscleFilter}
        onEquipmentFilterChange={setEquipmentFilter}
        resetFilters={resetFilters}
      />
      
      {isLoading ? (
        <LoadingSpinner message="Carregando exercícios..." />
      ) : (
        <ExerciseList
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          isDeleting={isDeleting}
          onToggleSelection={toggleExerciseSelection}
          onDelete={handleDelete}
          isFiltered={filteredExercises.length !== exercises.length}
          totalCount={exercises.length}
        />
      )}
    </div>
  );
};

export default ExerciseManager;
