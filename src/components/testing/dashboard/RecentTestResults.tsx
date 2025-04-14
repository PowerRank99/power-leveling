
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircleCheck, CircleX, Clock } from 'lucide-react';

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
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Recent Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center text-text-secondary py-4">
                No test results yet. Run some tests to see results here.
              </div>
            ) : (
              results.slice().reverse().slice(0, 10).map(result => (
                <div key={result.achievementId} className="p-2 border-b border-divider/20 flex items-center justify-between">
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
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto"
          onClick={() => {}}
        >
          View All Results
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentTestResults;
