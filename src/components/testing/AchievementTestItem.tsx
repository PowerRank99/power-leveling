
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Play, XCircle } from 'lucide-react';
import { Achievement } from '@/types/achievementTypes';

interface AchievementTestItemProps {
  achievement: Achievement;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRunTest: () => void;
  testResult?: {
    success: boolean;
    errorMessage?: string;
    testDurationMs: number;
  };
  isLoading: boolean;
}

const AchievementTestItem: React.FC<AchievementTestItemProps> = ({
  achievement,
  isSelected,
  onToggleSelect,
  onRunTest,
  testResult,
  isLoading
}) => {
  return (
    <div 
      className={`
        flex items-center justify-between p-2 rounded-md
        ${isSelected ? 'bg-arcane-15 border border-arcane-30' : 'border border-divider/10 hover:border-divider/30'}
      `}
    >
      <div className="flex items-center flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mr-2"
        />
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium">{achievement.name}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              Rank {achievement.rank}
            </Badge>
            {testResult && (
              <Badge 
                variant={testResult.success ? "success" : "valor"} 
                className="ml-2 text-xs"
              >
                {testResult.success ? 'Passed' : 'Failed'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-text-secondary">{achievement.description}</p>
          
          {testResult && !testResult.success && (
            <p className="text-xs text-valor mt-1">{testResult.errorMessage}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {testResult && (
          <Badge 
            variant="outline" 
            className="text-xs flex items-center"
          >
            <Clock className="mr-1 h-3 w-3" />
            {testResult.testDurationMs}ms
          </Badge>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRunTest}
          disabled={isLoading}
        >
          <Play className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AchievementTestItem;
