
import React from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

interface AchievementSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AchievementSearch: React.FC<AchievementSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-text-tertiary" />
      </div>
      <Input
        type="text"
        placeholder="Pesquisar conquistas..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full bg-midnight-elevated border-divider/30 text-text-primary placeholder:text-text-tertiary"
      />
    </div>
  );
};

export default AchievementSearch;
