
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Exercise } from '@/components/workout/types/Exercise';

interface SearchResultsProps {
  isLoading: boolean;
  results: Exercise[];
  searchInput: string;
  onSelectExercise: (exercise: Exercise) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  isLoading,
  results,
  searchInput,
  onSelectExercise,
}) => {
  return (
    <div className="max-h-[180px] overflow-hidden">
      <ScrollArea className="h-[180px] rounded-md border border-divider/20 bg-midnight-elevated">
        {isLoading ? (
          <div className="space-y-3 p-2">
            <p className="text-center text-sm text-gray-400 mb-2">Carregando exercícios...</p>
            <Skeleton className="h-12 w-full bg-midnight-card" />
            <Skeleton className="h-12 w-full bg-midnight-card" />
          </div>
        ) : results.length > 0 ? (
          <div className="p-2">
            {results.map(exercise => (
              <div 
                key={exercise.id} 
                className="cursor-pointer mb-2" 
                onClick={() => onSelectExercise(exercise)}
              >
                <div className="p-2 bg-midnight-card rounded-lg hover:bg-arcane-15 transition-colors">
                  <p className="font-orbitron font-semibold text-text-primary text-sm">{exercise.name}</p>
                  <p className="text-xs text-text-secondary">{exercise.muscle_group || 'Não especificado'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-4 px-2">
            {searchInput.length > 0 ? 'Nenhum exercício encontrado' : 'Digite para buscar exercícios'}
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default SearchResults;
