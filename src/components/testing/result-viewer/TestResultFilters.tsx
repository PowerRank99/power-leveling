
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AchievementCategory } from '@/types/achievementTypes';

interface TestResultFiltersProps {
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export const TestResultFilters: React.FC<TestResultFiltersProps> = ({
  searchQuery,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
        <Input
          placeholder="Search tests..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-full bg-midnight-elevated border-divider"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px] bg-midnight-elevated border-divider">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="passed">Passed only</SelectItem>
          <SelectItem value="failed">Failed only</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[160px] bg-midnight-elevated border-divider">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {Object.values(AchievementCategory).map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
