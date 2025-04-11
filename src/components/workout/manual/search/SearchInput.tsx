
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  searchInput: string;
  isLoading: boolean;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusInput: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  inputRef,
  searchInput,
  isLoading,
  handleSearchChange,
  focusInput,
}) => {
  return (
    <div className="relative flex items-center mb-4">
      <Search className="absolute left-3 text-gray-400 h-4 w-4" />
      <Input
        ref={inputRef}
        value={searchInput}
        onChange={handleSearchChange}
        placeholder="Buscar exercícios..."
        className="pl-10 bg-midnight-elevated border-arcane/30"
        disabled={isLoading}
        onClick={e => {
          e.stopPropagation();
          focusInput();
        }}
      />
    </div>
  );
};

export default SearchInput;
