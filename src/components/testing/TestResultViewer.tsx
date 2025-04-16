
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Download, Trash2, Search, FilterX, CheckSquare, XSquare } from 'lucide-react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface TestResultViewerProps {
  results: AchievementTestResult[];
  onClearResults: () => void;
  onExportResults: () => void;
}

export const TestResultViewer: React.FC<TestResultViewerProps> = ({
  results,
  onClearResults,
  onExportResults
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState<AchievementTestResult | null>(null);
  
  // Get unique categories and ranks
  const categories = Array.from(new Set(results.map(r => r.category)));
  const ranks = Array.from(new Set(results.map(r => r.rank)));
  
  // Filter results
  const filteredResults = results.filter(result => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      result.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || result.category === categoryFilter;
    
    // Filter by rank
    const matchesRank = rankFilter === 'all' || result.rank === rankFilter;
    
    // Filter by status
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'passed' && result.success) || 
      (statusFilter === 'failed' && !result.success);
    
    return matchesSearch && matchesCategory && matchesRank && matchesStatus;
  });
  
  // Stats
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  
  // Function to view result details
  const viewResultDetails = (result: AchievementTestResult) => {
    setSelectedResult(result);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Test Results</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onExportResults}
            disabled={results.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button
            variant="outline"
            onClick={onClearResults}
            disabled={results.length === 0}
            className="text-valor hover:text-valor hover:bg-valor-15"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Results
          </Button>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-midnight-elevated p-3 rounded-md border border-divider/20">
          <h3 className="text-sm font-medium mb-1">Total Tests</h3>
          <p className="text-2xl font-bold">{totalTests}</p>
        </div>
        <div className="bg-midnight-elevated p-3 rounded-md border border-divider/20">
          <h3 className="text-sm font-medium mb-1 text-green-500">Passed</h3>
          <p className="text-2xl font-bold text-green-500">
            {passedTests} 
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%)
            </span>
          </p>
        </div>
        <div className="bg-midnight-elevated p-3 rounded-md border border-divider/20">
          <h3 className="text-sm font-medium mb-1 text-valor">Failed</h3>
          <p className="text-2xl font-bold text-valor">
            {failedTests}
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0}%)
            </span>
          </p>
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search by achievement name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-midnight-elevated border-divider"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1 h-7 w-7"
            >
              <FilterX className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        <Select 
          value={categoryFilter} 
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-32 bg-midnight-elevated border-divider">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={rankFilter} 
          onValueChange={setRankFilter}
        >
          <SelectTrigger className="w-24 bg-midnight-elevated border-divider">
            <SelectValue placeholder="Rank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            {ranks.map(rank => (
              <SelectItem key={rank} value={rank}>Rank {rank}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-28 bg-midnight-elevated border-divider">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-divider/30 rounded-md">
          <div className="border-b border-divider/30 p-3 bg-midnight-elevated flex items-center justify-between">
            <h3 className="text-sm font-medium">Test Results ({filteredResults.length})</h3>
          </div>
          
          <ScrollArea className="h-[400px]">
            {filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-text-tertiary">
                <FilterX className="h-10 w-10 mb-2 opacity-40" />
                <p>No results match your filters</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`
                      flex items-center p-2 rounded-md cursor-pointer
                      ${result === selectedResult ? 'bg-arcane-15 border border-arcane-30' : 'hover:bg-midnight-elevated border border-divider/10'}
                    `}
                    onClick={() => viewResultDetails(result)}
                  >
                    <div className="mr-2">
                      {result.success ? (
                        <CheckSquare className="h-4 w-4 text-green-500" />
                      ) : (
                        <XSquare className="h-4 w-4 text-valor" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-medium text-sm truncate">{result.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {result.category}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-text-secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {result.testDurationMs}ms
                        <Badge 
                          variant="outline" 
                          className="ml-2 text-xs"
                        >
                          Rank {result.rank}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-60 hover:opacity-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <div className="border border-divider/30 rounded-md">
          <div className="border-b border-divider/30 p-3 bg-midnight-elevated">
            <h3 className="text-sm font-medium">Result Details</h3>
          </div>
          
          {selectedResult ? (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedResult.name}</h3>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={selectedResult.success ? "success" : "valor"}
                    className="mr-2"
                  >
                    {selectedResult.success ? 'PASSED' : 'FAILED'}
                  </Badge>
                  
                  <Badge variant="outline" className="mr-2">
                    {selectedResult.category}
                  </Badge>
                  
                  <Badge variant="outline">
                    Rank {selectedResult.rank}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Test Duration</h4>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1.5 text-text-secondary" />
                  {selectedResult.testDurationMs}ms
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Achievement ID</h4>
                <code className="block p-2 bg-midnight-elevated rounded text-xs font-mono border border-divider/20 overflow-x-auto">
                  {selectedResult.achievementId}
                </code>
              </div>
              
              {!selectedResult.success && selectedResult.errorMessage && (
                <div>
                  <h4 className="text-sm font-medium mb-1 text-valor">Error Details</h4>
                  <div className="p-3 bg-valor-15 border border-valor-30 rounded text-sm">
                    {selectedResult.errorMessage}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-text-tertiary">
              <Eye className="h-10 w-10 mb-2 opacity-40" />
              <p>Select a test result to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
