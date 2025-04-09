
import React from 'react';
import { X, Dumbbell, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useExerciseSearch } from './hooks/useExerciseSearch';
import ExerciseSearchBar from './search/ExerciseSearchBar';
import ExerciseList from './search/ExerciseList';
import RecentExercises from './search/RecentExercises';
import FilterSheet from './filters/FilterSheet';
import { FILTERED_EQUIPMENT_TYPES, MUSCLE_GROUPS } from './hooks/exercise-search/useExerciseSearch';
import { Exercise } from './types/Exercise';
import { toast } from '@/components/ui/use-toast';

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
  const {
    searchQuery,
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
  } = useExerciseSearch({ selectedExercises });

  const handleSelectExercise = (exercise: Exercise) => {
    onAddExercise(exercise);
    toast({
      title: 'Exercício adicionado',
      description: `${exercise.name} foi adicionado à rotina`
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 items-center mb-4">
          <ExerciseSearchBar 
            searchQuery={searchQuery} 
            onChange={handleSearchChange} 
          />
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={resetFilters}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <FilterSheet 
            title="Selecione o equipamento" 
            options={FILTERED_EQUIPMENT_TYPES} 
            selectedOption={equipmentFilter} 
            icon={Dumbbell} 
            label="Equipamento" 
            onOptionSelect={(option) => {
              console.log(`Setting equipment filter to: ${option}`);
              setEquipmentFilter(option);
            }} 
          />

          <FilterSheet 
            title="Selecione o tipo de exercício" 
            options={MUSCLE_GROUPS} 
            selectedOption={muscleFilter} 
            icon={Filter} 
            label="Exercício" 
            onOptionSelect={(option) => {
              console.log(`Setting muscle filter to: ${option}`);
              setMuscleFilter(option);
            }} 
          />
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-4">
        {isLoading ? (
          <LoadingSpinner message="Buscando exercícios..." />
        ) : (
          <div>
            {searchQuery === '' && equipmentFilter === 'Todos' && muscleFilter === 'Todos' && (
              <RecentExercises 
                exercises={recentExercises} 
                onSelectExercise={handleSelectExercise} 
              />
            )}

            <ExerciseList 
              exercises={filteredExercises} 
              hasActiveFilters={hasActiveFilters}
              searchQuery={searchQuery}
              equipmentFilter={equipmentFilter}
              muscleFilter={muscleFilter}
              onSelectExercise={handleSelectExercise} 
            />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onClose}
        >
          Fechar Busca
        </Button>
      </div>
    </div>
  );
};

export default ExerciseSearch;
