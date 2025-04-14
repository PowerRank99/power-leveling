
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CircleX, Clock, AlertTriangle } from 'lucide-react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface TestResultViewerProps {
  results: AchievementTestResult[];
  title?: string;
  maxHeight?: string;
}

const TestResultViewer: React.FC<TestResultViewerProps> = ({ 
  results, 
  title = "Test Results", 
  maxHeight = "400px" 
}) => {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-text-secondary">
            <AlertTriangle className="mb-2 h-10 w-10 opacity-50" />
            <p>No test results available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="arcane" className="px-2 py-0.5">
              {results.filter(r => r.success).length} Passed
            </Badge>
            {results.some(r => !r.success) && (
              <Badge variant="valor" className="px-2 py-0.5">
                {results.filter(r => !r.success).length} Failed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`h-[${maxHeight}]`}>
          <div className="space-y-2">
            {results.map(result => (
              <div 
                key={result.achievementId} 
                className="p-2 border-b border-divider/20 flex items-center justify-between"
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CircleCheck className="h-5 w-5 text-success mr-2" />
                  ) : (
                    <CircleX className="h-5 w-5 text-valor mr-2" />
                  )}
                  <div>
                    <h4 className="font-semibold text-text-primary">{result.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Badge variant="outline" className="px-1 py-0 text-xs">
                        {result.category}
                      </Badge>
                      <Badge variant="outline" className="px-1 py-0 text-xs">
                        Rank {result.rank}
                      </Badge>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {result.testDurationMs}ms
                      </span>
                    </div>
                  </div>
                </div>
                {!result.success && (
                  <div className="text-xs text-valor max-w-[50%] text-right">
                    {result.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TestResultViewer;
