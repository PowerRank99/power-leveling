
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

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
  if (!isRunning && total === 0) {
    return null;
  }
  
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="mb-4 p-3 border border-divider/30 rounded-md bg-midnight-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {isRunning && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin text-arcane" />
          )}
          <span className="text-sm">
            {isRunning ? 'Running tests...' : 'Test results:'}
          </span>
        </div>
        <span className="text-sm">
          {current} / {total} ({percentage}%)
        </span>
      </div>
      
      <Progress
        value={percentage}
        className="h-2 mb-2"
      />
      
      {isRunning && currentTest && (
        <div className="text-xs text-text-secondary mt-1">
          Currently testing: {currentTest}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-2 text-xs">
        <div>
          <span className="text-green-500 mr-3">{successful} passed</span>
          <span className="text-valor">{failed} failed</span>
        </div>
        {isRunning && (
          <div className="text-text-secondary">
            {total - current} remaining
          </div>
        )}
      </div>
    </div>
  );
};

export default TestProgressIndicator;
