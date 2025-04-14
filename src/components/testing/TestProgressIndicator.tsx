
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AchievementTestProgress } from '@/services/testing/AchievementTestingService';

interface TestProgressIndicatorProps {
  progress: AchievementTestProgress;
}

const TestProgressIndicator: React.FC<TestProgressIndicatorProps> = ({ progress }) => {
  if (!progress.isRunning) {
    return null;
  }

  const progressPercentage = progress.total ? (progress.completed / progress.total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="animate-pulse bg-arcane-15">
            Running Tests
          </Badge>
          <span className="text-sm">
            {progress.completed} of {progress.total} completed
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-arcane">{progress.successful} passed</span>
          {progress.failed > 0 && (
            <span className="text-valor">{progress.failed} failed</span>
          )}
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      {progress.currentTest && (
        <div className="text-sm text-text-secondary">
          Testing: {progress.currentTest}
        </div>
      )}
    </div>
  );
};

export default TestProgressIndicator;
