
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, CircleCheck, CircleX, PlayCircle } from 'lucide-react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface AchievementTestItemProps {
  achievement: any;
  isSelected: boolean;
  testResult?: AchievementTestResult;
  onToggleSelect: () => void;
  onRunTest: () => void;
  isDisabled: boolean;
}

const AchievementTestItem: React.FC<AchievementTestItemProps> = ({
  achievement,
  isSelected,
  testResult,
  onToggleSelect,
  onRunTest,
  isDisabled
}) => {
  return (
    <div 
      className={`p-3 border rounded-md flex items-center justify-between ${
        isSelected ? 'border-arcane-30 bg-arcane-15' : 'border-divider/20'
      }`}
    >
      <div className="flex items-center">
        <div 
          className="mr-3 cursor-pointer"
          onClick={onToggleSelect}
        >
          {isSelected ? (
            <div className="h-5 w-5 rounded border-2 border-arcane bg-arcane-30 flex items-center justify-center">
              <Check className="h-3 w-3 text-arcane" />
            </div>
          ) : (
            <div className="h-5 w-5 rounded border-2 border-divider"></div>
          )}
        </div>
        
        <div>
          <p className="font-medium">{achievement.name}</p>
          <div className="flex items-center text-text-secondary text-xs">
            <Badge variant="outline" className="mr-1 px-1 py-0 text-xs">
              Rank {achievement.rank}
            </Badge>
            <span className="ml-1 text-xs">
              {achievement.requirementType}: {achievement.requirementValue}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {testResult && (
          <div className="flex items-center mr-2">
            {testResult.success ? (
              <Badge variant="arcane" className="px-1 py-0 text-xs">
                <CircleCheck className="h-3 w-3 mr-1" />
                {testResult.testDurationMs}ms
              </Badge>
            ) : (
              <Badge variant="valor" className="px-1 py-0 text-xs">
                <CircleX className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRunTest}
          disabled={isDisabled}
        >
          <PlayCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AchievementTestItem;
