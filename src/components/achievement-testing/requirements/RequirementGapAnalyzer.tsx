
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, Timer, TrendingUp } from 'lucide-react';
import { Achievement } from '@/types/achievementTypes';

interface RequirementGapAnalyzerProps {
  achievement: Achievement;
  currentProgress: number;
  targetValue: number;
  onGenerateData: () => void;
}

const RequirementGapAnalyzer: React.FC<RequirementGapAnalyzerProps> = ({
  achievement,
  currentProgress,
  targetValue,
  onGenerateData
}) => {
  const progress = (currentProgress / targetValue) * 100;
  const gap = targetValue - currentProgress;
  
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progress to Achievement</span>
          <span className="text-sm text-text-secondary">
            {currentProgress} / {targetValue}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Gap Analysis</h4>
        
        <div className="flex items-center space-x-2 text-sm">
          {gap > 0 ? (
            <>
              <AlertTriangle className="h-4 w-4 text-valor" />
              <span>
                Need {gap} more {achievement.requirements.type.toLowerCase()} to unlock
              </span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 text-success" />
              <span>Requirements met!</span>
            </>
          )}
        </div>
        
        {gap > 0 && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateData}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Required Data
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RequirementGapAnalyzer;
