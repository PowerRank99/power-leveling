
import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface TestResultCardProps {
  result: AchievementTestResult;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({ result }) => {
  return (
    <Card className="p-3 hover:bg-midnight-elevated">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-valor" />
            )}
            <span className="font-semibold">{result.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Badge variant="outline" className="px-2 py-0">
              {result.category}
            </Badge>
            <Badge variant="outline" className="px-2 py-0">
              Rank {result.rank}
            </Badge>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {result.testDurationMs}ms
            </span>
            <span>
              {new Date(result.testedAt).toLocaleString()}
            </span>
          </div>
          
          {!result.success && result.errorMessage && (
            <div className="mt-2 text-sm text-valor bg-valor/10 p-2 rounded">
              {result.errorMessage}
            </div>
          )}
        </div>
        
        <Badge 
          variant={result.success ? "success" : "valor"}
          className="ml-2"
        >
          {result.success ? 'Passed' : 'Failed'}
        </Badge>
      </div>
    </Card>
  );
};
