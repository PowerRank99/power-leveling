
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  RefreshCcw, 
  CheckSquare, 
  XSquare,
  Trash2 
} from 'lucide-react';
import ExerciseFilters from './ExerciseFilters';
import { AdminExercise } from './types/exercise';

interface ExerciseListActionsProps {
  totalCount: number;
  filteredCount: number;
  selectedExercises: string[];
  filteredExercises: AdminExercise[];
  onToggleSelectAll: (exercises: AdminExercise[]) => void;
  onDeleteSelected: () => void;
  onRefresh: () => void;
  searchQuery: string;
  muscleFilter: string;
  equipmentFilter: string;
  muscleGroups: string[];
  equipmentTypes: string[];
  onSearchQueryChange: (value: string) => void;
  onMuscleFilterChange: (value: string) => void;
  onEquipmentFilterChange: (value: string) => void;
  resetFilters: () => void;
}

const ExerciseListActions: React.FC<ExerciseListActionsProps> = ({
  totalCount,
  filteredCount,
  selectedExercises,
  filteredExercises,
  onToggleSelectAll,
  onDeleteSelected,
  onRefresh,
  searchQuery,
  muscleFilter,
  equipmentFilter,
  muscleGroups,
  equipmentTypes,
  onSearchQueryChange,
  onMuscleFilterChange,
  onEquipmentFilterChange,
  resetFilters,
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
      <div>
        <h3 className="text-lg font-bold">Exercícios Cadastrados ({totalCount})</h3>
        <div className="text-sm text-gray-500">
          {filteredCount !== totalCount && 
            `Mostrando ${filteredCount} de ${totalCount}`}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedExercises.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDeleteSelected}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir ({selectedExercises.length})
          </Button>
        )}

        <ExerciseFilters 
          searchQuery={searchQuery}
          muscleFilter={muscleFilter}
          equipmentFilter={equipmentFilter}
          muscleGroups={muscleGroups}
          equipmentTypes={equipmentTypes}
          onSearchQueryChange={onSearchQueryChange}
          onMuscleFilterChange={onMuscleFilterChange}
          onEquipmentFilterChange={onEquipmentFilterChange}
          resetFilters={resetFilters}
        />
        
        <Button variant="outline" size="sm" onClick={() => onToggleSelectAll(filteredExercises)}>
          {selectedExercises.length === filteredExercises.length && filteredExercises.length > 0 ? (
            <>
              <XSquare className="mr-2 h-4 w-4" />
              Desmarcar Todos
            </>
          ) : (
            <>
              <CheckSquare className="mr-2 h-4 w-4" />
              Selecionar Todos
            </>
          )}
        </Button>
        
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>
    </div>
  );
};

export default ExerciseListActions;
