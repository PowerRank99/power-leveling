
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, FilterX, Search } from 'lucide-react';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

interface AchievementTestHeaderProps {
  onRunTests: () => void;
  onStopTests: () => void;
  onFilterChange: (category: string, rank: string) => void;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  selectedRank: string;
  searchQuery: string;
  isRunning: boolean;
  testCount: number;
}

const AchievementTestHeader: React.FC<AchievementTestHeaderProps> = ({
  onRunTests,
  onStopTests,
  onFilterChange,
  onSearchChange,
  selectedCategory,
  selectedRank,
  searchQuery,
  isRunning,
  testCount
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64 bg-midnight-elevated border-divider"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1 h-7 w-7"
            >
              <FilterX className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        <Select value={selectedCategory} onValueChange={(value) => onFilterChange(value, selectedRank)}>
          <SelectTrigger className="w-40 bg-midnight-elevated border-divider">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(AchievementCategory).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={selectedRank} onValueChange={(value) => onFilterChange(selectedCategory, value)}>
          <SelectTrigger className="w-32 bg-midnight-elevated border-divider">
            <SelectValue placeholder="Rank" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Ranks</SelectItem>
              {Object.values(AchievementRank).map(rank => (
                <SelectItem key={rank} value={rank}>Rank {rank}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-midnight-elevated">
          {testCount} achievements
        </Badge>
        
        {isRunning ? (
          <Button variant="valor" onClick={onStopTests}>
            <Pause className="mr-2 h-4 w-4" />
            Stop Tests
          </Button>
        ) : (
          <Button variant="arcane" onClick={onRunTests}>
            <Play className="mr-2 h-4 w-4" />
            Run Tests
          </Button>
        )}
      </div>
    </div>
  );
};

export default AchievementTestHeader;
