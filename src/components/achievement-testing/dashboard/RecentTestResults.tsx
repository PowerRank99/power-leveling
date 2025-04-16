
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';
import { formatDistanceToNow } from 'date-fns';

interface RecentTestResultsProps {
  results: AchievementTestResult[];
}

const RecentTestResults: React.FC<RecentTestResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-text-tertiary">
            <p>No test results yet</p>
            <p className="text-xs">Run some tests to see results here</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Recent Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div 
              key={`${result.achievementId}-${index}`} 
              className="border-b border-divider/10 last:border-0 pb-2 last:pb-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  
                  <div>
                    <h4 className="font-medium text-text-primary">{result.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-text-secondary">
                      <Badge variant="outline" className="px-1 py-0 text-xs capitalize">
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
                    
                    {!result.success && result.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{result.errorMessage}</p>
                    )}
                  </div>
                </div>
                
                <span className="text-xs text-text-tertiary whitespace-nowrap">
                  {result.testedAt ? formatDistanceToNow(new Date(result.testedAt), { addSuffix: true }) : 'Just now'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTestResults;
