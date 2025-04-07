
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExerciseSearchBarProps {
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExerciseSearchBar: React.FC<ExerciseSearchBarProps> = ({ searchQuery, onChange }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        value={searchQuery}
        onChange={onChange}
        placeholder="Buscar exercícios..."
        className="pl-10"
      />
    </div>
  );
};

export default ExerciseSearchBar;
