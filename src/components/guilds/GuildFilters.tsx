
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterIcon } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface GuildFiltersProps {
  filterOptions: FilterOption[];
  activeFilter: string | null;
  onFilterClick: (filterId: string) => void;
}

const GuildFilters: React.FC<GuildFiltersProps> = ({ 
  filterOptions, 
  activeFilter, 
  onFilterClick 
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {filterOptions.map(filter => (
        <Badge
          key={filter.id}
          variant={activeFilter === filter.id ? "arcane" : "guild"}
          className="cursor-pointer px-3 py-1.5 text-sm font-sora transform transition-all duration-300 hover:scale-105"
          onClick={() => onFilterClick(filter.id)}
        >
          {filter.label}
        </Badge>
      ))}
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-midnight-elevated border-divider hover:bg-arcane-15 hover:border-arcane-30 text-text-secondary flex items-center gap-1.5 h-7 ml-1 transition-all duration-300 hover:shadow-glow-subtle"
      >
        <FilterIcon className="h-3.5 w-3.5" />
        Mais filtros
      </Button>
    </div>
  );
};

export default GuildFilters;
