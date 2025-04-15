
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface RecentTestResultsProps {
  results: Array<{
    achievementId: string;
    name: string;
    category: string;
    rank: string;
    success: boolean;
    errorMessage?: string;
    testDurationMs: number;
  }>;
}

const RecentTestResults: React.FC<RecentTestResultsProps> = ({ results }) => {
  const lastFiveResults = results.slice(-5).reverse();

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Recent Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {lastFiveResults.length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              No test results yet
            </div>
          ) : (
            <div className="space-y-4">
              {lastFiveResults.map((result) => (
                <div 
                  key={result.achievementId}
                  className="p-3 border border-divider/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-valor" />
                        )}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{result.category}</Badge>
                        <Badge variant="outline">Rank {result.rank}</Badge>
                        <span className="text-xs text-text-secondary flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {result.testDurationMs}ms
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={result.success ? "success" : "valor"}
                      className="ml-2"
                    >
                      {result.success ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                  {!result.success && result.errorMessage && (
                    <div className="mt-2 text-sm text-valor bg-valor/10 p-2 rounded">
                      {result.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentTestResults;
