
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, Download, Trash2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface TestResultViewerProps {
  results: AchievementTestResult[];
  onClearResults: () => void;
  onExportResults: () => void;
  filter: string;
  onFilterChange: (value: string) => void;
}

const TestResultViewer: React.FC<TestResultViewerProps> = ({
  results,
  onClearResults,
  onExportResults,
  filter,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredResults = results.filter(result => {
    if (filter === 'passed') return result.success;
    if (filter === 'failed') return !result.success;
    if (searchQuery) {
      return result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             result.category.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
             (result.errorMessage && result.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });
  
  const passedCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Test Results</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearResults}
              disabled={results.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExportResults}
              disabled={results.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-midnight-elevated rounded-md p-3 text-center">
            <div className="text-xl font-semibold">{results.length}</div>
            <div className="text-sm text-text-secondary">Total Tests</div>
          </div>
          <div className="bg-success/10 border border-success/20 rounded-md p-3 text-center">
            <div className="text-xl font-semibold text-success">{passedCount}</div>
            <div className="text-sm text-text-secondary">Passed</div>
          </div>
          <div className="bg-valor/10 border border-valor/20 rounded-md p-3 text-center">
            <div className="text-xl font-semibold text-valor">{failedCount}</div>
            <div className="text-sm text-text-secondary">Failed</div>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-2">
          <Input
            placeholder="Search results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-midnight-elevated border-divider"
          />
          <Button 
            variant={filter === 'all' ? 'arcane' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'passed' ? 'arcane' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('passed')}
          >
            Passed
          </Button>
          <Button 
            variant={filter === 'failed' ? 'arcane' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('failed')}
          >
            Failed
          </Button>
        </div>
        
        <ScrollArea className="h-[400px] border border-divider/20 rounded-md">
          {filteredResults.length === 0 ? (
            <div className="text-center text-text-secondary p-4">
              No results match your filter criteria.
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {filteredResults.map(result => (
                <div 
                  key={result.achievementId} 
                  className="border border-divider/20 rounded-md p-3 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center">
                        {result.success ? (
                          <Check className="h-4 w-4 text-success mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-valor mr-1" />
                        )}
                        {result.name}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{result.category}</Badge>
                        <Badge variant="outline">Rank {result.rank}</Badge>
                        <Badge 
                          variant="outline" 
                          className="flex items-center"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {result.testDurationMs}ms
                        </Badge>
                      </div>
                    </div>
                    <Badge 
                      variant={result.success ? "success" : "valor"}
                    >
                      {result.success ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                  
                  {!result.success && result.errorMessage && (
                    <div className="text-sm text-valor bg-valor/10 p-2 rounded">
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

export default TestResultViewer;
