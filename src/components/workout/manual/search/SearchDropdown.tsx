
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import { Exercise } from '@/components/workout/types/Exercise';

interface SearchDropdownProps {
  inputRef: React.RefObject<HTMLInputElement>;
  searchInput: string;
  isLoading: boolean;
  results: Exercise[];
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusInput: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  inputRef,
  searchInput,
  isLoading,
  results,
  handleSearchChange,
  focusInput,
  onSelectExercise,
  onClose,
}) => {
  return (
    <div className="p-4 bg-midnight-card rounded-lg border border-arcane/30 shadow-md">
      <SearchInput
        inputRef={inputRef}
        searchInput={searchInput}
        isLoading={isLoading}
        handleSearchChange={handleSearchChange}
        focusInput={focusInput}
      />
      
      <SearchResults
        isLoading={isLoading}
        results={results}
        searchInput={searchInput}
        onSelectExercise={onSelectExercise}
      />
      
      <div className="mt-4">
        <Button 
          type="button" 
          variant="arcane" 
          className="w-full text-text-primary"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default SearchDropdown;
