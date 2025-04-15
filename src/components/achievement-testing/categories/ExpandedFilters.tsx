
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

interface ExpandedFiltersProps {
  selectedCategory: string;
  selectedRank: string;
  showSuccessful: boolean;
  showFailed: boolean;
  showPending: boolean;
  setSelectedCategory: (category: string) => void;
  setSelectedRank: (rank: string) => void;
  toggleShowSuccessful: () => void;
  toggleShowFailed: () => void;
  toggleShowPending: () => void;
}

const ExpandedFilters: React.FC<ExpandedFiltersProps> = ({
  selectedCategory,
  selectedRank,
  showSuccessful,
  showFailed,
  showPending,
  setSelectedCategory,
  setSelectedRank,
  toggleShowSuccessful,
  toggleShowFailed,
  toggleShowPending
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-divider/20">
      <div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-midnight-card border-divider">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(AchievementCategory).map(category => (
              <SelectItem key={category} value={category} className="capitalize">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={selectedRank} onValueChange={setSelectedRank}>
          <SelectTrigger className="bg-midnight-card border-divider">
            <SelectValue placeholder="All Ranks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            {Object.values(AchievementRank).map(rank => (
              <SelectItem key={rank} value={rank}>
                Rank {rank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-passed"
            checked={showSuccessful}
            onCheckedChange={toggleShowSuccessful}
          />
          <label htmlFor="show-passed" className="text-sm flex items-center cursor-pointer">
            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
            Passed
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-failed"
            checked={showFailed}
            onCheckedChange={toggleShowFailed}
          />
          <label htmlFor="show-failed" className="text-sm flex items-center cursor-pointer">
            <XCircle className="h-3 w-3 text-red-500 mr-1" />
            Failed
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-pending"
            checked={showPending}
            onCheckedChange={toggleShowPending}
          />
          <label htmlFor="show-pending" className="text-sm flex items-center cursor-pointer">
            <Badge className="h-3 w-3 flex items-center justify-center bg-gray-500 mr-1">?</Badge>
            Pending
          </label>
        </div>
      </div>
    </div>
  );
};

export default ExpandedFilters;
