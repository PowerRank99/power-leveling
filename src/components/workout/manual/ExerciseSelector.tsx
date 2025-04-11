
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Exercise } from '@/components/workout/types/Exercise';
import { useExerciseSearch } from '@/components/workout/hooks/useExerciseSearch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ExerciseCard from '@/components/workout/ExerciseCard';
import { Collapse } from '@/components/ui/collapse';

interface ExerciseSelectorProps {
  selectedExercise: Exercise | null;
  onExerciseSelect: (exercise: Exercise | null) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercise,
  onExerciseSelect,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const {
    searchQuery,
    filteredExercises,
    isLoading,
    handleSearchChange,
    resetFilters,
  } = useExerciseSearch({ selectedExercises: selectedExercise ? [selectedExercise] : [] });
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      resetFilters();
    }
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setIsSearchOpen(false);
  };
  
  const handleClearSelection = () => {
    onExerciseSelect(null);
  };
  
  return (
    <div className="space-y-3">
      <Label htmlFor="exercise">Tipo de Exercício</Label>
      
      {selectedExercise ? (
        <div className="relative">
          <ExerciseCard
            name={selectedExercise.name}
            category={selectedExercise.category}
            level={selectedExercise.level as any}
            type="Força"
            image={selectedExercise.image_url || '/placeholder.svg'}
            description={selectedExercise.description || ''}
            equipment={selectedExercise.equipment || ''}
            muscleGroup={selectedExercise.muscle_group || selectedExercise.category || 'Não especificado'}
            equipmentType={selectedExercise.equipment_type || 'Não especificado'}
          />
          <button 
            className="absolute top-3 right-3 bg-red-100 text-red-600 p-2 rounded-full"
            onClick={handleClearSelection}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex justify-between items-center bg-midnight-elevated border-arcane/30"
          onClick={toggleSearch}
        >
          <span className="text-gray-400">Selecione um exercício</span>
          {isSearchOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      )}
      
      <Collapse open={isSearchOpen}>
        <div className="p-4 bg-midnight-card rounded-lg border border-arcane/30 shadow-md">
          <div className="relative flex items-center mb-4">
            <Search className="absolute left-3 text-gray-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar exercícios..."
              className="pl-10 bg-midnight-elevated border-arcane/30"
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <LoadingSpinner message="Carregando exercícios..." />
            ) : filteredExercises.length > 0 ? (
              filteredExercises.map(exercise => (
                <div 
                  key={exercise.id} 
                  className="cursor-pointer mb-2" 
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <ExerciseCard
                    name={exercise.name}
                    category={exercise.category}
                    level={exercise.level as any}
                    type="Força"
                    image={exercise.image_url || '/placeholder.svg'}
                    description={exercise.description || ''}
                    equipment={exercise.equipment || ''}
                    muscleGroup={exercise.muscle_group || exercise.category || 'Não especificado'}
                    equipmentType={exercise.equipment_type || 'Não especificado'}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">
                Nenhum exercício encontrado
              </p>
            )}
          </div>
          
          <div className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={toggleSearch}
            >
              Fechar
            </Button>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ExerciseSelector;
