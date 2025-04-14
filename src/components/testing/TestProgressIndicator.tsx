
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface TestProgressIndicatorProps {
  completed: number;
  total: number;
  successful: number;
  failed: number;
  currentTest?: string;
  isRunning: boolean;
}

const TestProgressIndicator: React.FC<TestProgressIndicatorProps> = ({
  completed,
  total,
  successful,
  failed,
  currentTest,
  isRunning
}) => {
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  
  if (!isRunning && completed === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {isRunning && <Loader2 className="animate-spin h-4 w-4 mr-2 text-arcane" />}
          <span className="text-sm">
            Progress: {completed}/{total} ({progressPercentage.toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success" className="bg-success/20 text-success">
            {successful} passed
          </Badge>
          {failed > 0 && (
            <Badge variant="valor" className="bg-valor/20 text-valor">
              {failed} failed
            </Badge>
          )}
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      {currentTest && (
        <div className="text-xs text-text-secondary flex items-center">
          <span className="font-bold mr-1">Testing:</span> {currentTest}
        </div>
      )}
    </div>
  );
};

export default TestProgressIndicator;
