
import React from 'react';
import { Filter, FilterX, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FilterHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filtersExpanded: boolean;
  setFiltersExpanded: (expanded: boolean) => void;
  filteredCount: number;
  runTests: () => void;
  isLoading: boolean;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  filtersExpanded,
  setFiltersExpanded,
  filteredCount,
  runTests,
  isLoading
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex items-center space-x-2 flex-grow">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-midnight-card border-divider"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1 h-7 w-7"
            >
              <FilterX className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="flex-shrink-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-midnight-card">
          {filteredCount} achievements
        </Badge>
        
        <Button 
          variant="arcane" 
          size="sm" 
          onClick={runTests}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          <Play className="h-4 w-4 mr-1" />
          Run Selected
        </Button>
      </div>
    </div>
  );
};

export default FilterHeader;
