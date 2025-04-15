
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TestProgressIndicatorProps {
  current: number;
  total: number;
  successful: number;
  failed: number;
  isRunning: boolean;
  currentTest?: string;
}

const TestProgressIndicator: React.FC<TestProgressIndicatorProps> = ({
  current,
  total,
  successful,
  failed,
  isRunning,
  currentTest
}) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  
  if (!isRunning && total === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2 p-3 bg-midnight-card rounded-md border border-divider/30">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-text-secondary" />
          <span>
            {isRunning ? (
              <span className="text-text-primary">
                Testing {current}/{total}
              </span>
            ) : (
              <span className="text-text-secondary">
                Completed {current}/{total}
              </span>
            )}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {successful > 0 && (
            <Badge variant="success" className="flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {successful}
            </Badge>
          )}
          
          {failed > 0 && (
            <Badge variant="valor" className="flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              {failed}
            </Badge>
          )}
        </div>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
        color={failed > 0 ? 'valor' : 'success'} 
      />
      
      {isRunning && currentTest && (
        <div className="text-xs text-text-secondary animate-pulse">
          Testing: {currentTest}
        </div>
      )}
    </div>
  );
};

export default TestProgressIndicator;
