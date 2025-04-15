
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Info 
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Achievement } from '@/types/achievementTypes';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { getRankColorClass } from '@/utils/achievementUtils';

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
  const { userAchievements, simulateAchievement } = useTestingDashboard();
  
  const isUnlocked = userAchievements[achievement.id]?.isUnlocked || false;
  
  return (
    <div className={`flex items-center p-2 rounded-md ${isSelected ? 'bg-arcane-15 border border-arcane-30' : 'hover:bg-midnight-elevated'}`}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        className="mr-2 data-[state=checked]:bg-arcane data-[state=checked]:border-arcane"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h4 className="font-medium text-sm truncate mr-2">{achievement.name}</h4>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Badge variant="outline" className={`px-1 py-0 text-xs ${getRankColorClass(achievement.rank)}`}>
              {achievement.rank}
            </Badge>
            
            {isUnlocked && (
              <Badge variant="outline" className="px-1 py-0 text-xs bg-green-900/20 text-green-500 border-green-900/30">
                Unlocked
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-xs text-text-secondary truncate">{achievement.description}</p>
        
        {testResult && !testResult.success && testResult.errorMessage && (
          <p className="text-xs text-red-500 truncate">{testResult.errorMessage}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-1 ml-2">
        {testResult && (
          <>
            {testResult.success ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-text-tertiary ml-1">
                        {testResult.testDurationMs}ms
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Test passed in {testResult.testDurationMs}ms</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-text-tertiary ml-1">
                        {testResult.testDurationMs}ms
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Test failed: {testResult.errorMessage}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onRunTest}
          disabled={isLoading}
          className="h-7 w-7"
        >
          <Play className="h-3 w-3" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => simulateAchievement(achievement.id)}
          className="h-7 w-7"
        >
          <Info className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AchievementTestItem;
