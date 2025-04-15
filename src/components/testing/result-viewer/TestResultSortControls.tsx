
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TestResultSortControlsProps {
  sortBy: string;
  sortOrder: string;
  onSortByChange: (value: string) => void;
  onSortOrderChange: () => void;
}

export const TestResultSortControls: React.FC<TestResultSortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}) => {
  return (
    <div className="flex">
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="rounded-r-none border-r-0 bg-midnight-elevated border-divider">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most recent</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="duration">Duration</SelectItem>
          <SelectItem value="category">Category</SelectItem>
          <SelectItem value="rank">Rank</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-l-none bg-midnight-elevated border-divider"
        onClick={onSortOrderChange}
      >
        {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    </div>
  );
};
