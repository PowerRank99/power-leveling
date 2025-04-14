
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play } from 'lucide-react';
import { Achievement } from '@/types/achievementTypes';
import AchievementTestItem from './AchievementTestItem';

interface AchievementCategorySectionProps {
  category: string;
  achievements: Achievement[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRunCategoryTests: () => void;
  onRunSingleTest: (achievementId: string) => void;
  onToggleSelect: (achievementId: string) => void;
  selectedAchievements: string[];
  testResults: Record<string, {success: boolean, errorMessage?: string, testDurationMs: number}>;
  isLoading: boolean;
}

const AchievementCategorySection: React.FC<AchievementCategorySectionProps> = ({
  category,
  achievements,
  isExpanded,
  onToggleExpand,
  onRunCategoryTests,
  onRunSingleTest,
  onToggleSelect,
  selectedAchievements,
  testResults,
  isLoading
}) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center justify-start w-full p-2">
            {isExpanded ? 
              <ChevronDown className="mr-2 h-4 w-4" /> : 
              <ChevronRight className="mr-2 h-4 w-4" />}
            <span className="font-semibold">{category}</span>
            <Badge variant="outline" className="ml-2">
              {achievements.length}
            </Badge>
          </Button>
        </CollapsibleTrigger>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRunCategoryTests}
          disabled={isLoading}
        >
          <Play className="mr-2 h-3 w-3" />
          Run Category
        </Button>
      </div>
      
      <CollapsibleContent>
        <div className="mt-2 space-y-2 pl-6">
          {achievements.map(achievement => (
            <AchievementTestItem 
              key={achievement.id}
              achievement={achievement}
              isSelected={selectedAchievements.includes(achievement.id)}
              onToggleSelect={() => onToggleSelect(achievement.id)}
              onRunTest={() => onRunSingleTest(achievement.id)}
              testResult={testResults[achievement.id]}
              isLoading={isLoading}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AchievementCategorySection;
