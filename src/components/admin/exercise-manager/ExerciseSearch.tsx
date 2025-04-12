
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface ExerciseSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ searchTerm, setSearchTerm }) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative mb-4">
      <Input
        type="text"
        placeholder="Buscar exercício por nome, tipo ou grupo muscular..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ExerciseSearch;
