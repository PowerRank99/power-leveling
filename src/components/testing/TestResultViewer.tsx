
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Filter } from 'lucide-react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';
import { TestResultFilters } from './result-viewer/TestResultFilters';
import { TestResultSortControls } from './result-viewer/TestResultSortControls';
import { TestResultCard } from './result-viewer/TestResultCard';

interface TestResultViewerProps {
  results: AchievementTestResult[];
  onClearResults: () => void;
  onExportResults: () => void;
}

export function TestResultViewer({ results, onClearResults, onExportResults }: TestResultViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('all');
  
  // Count stats
  const passedCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  
  // Apply filters and sort
  const filteredResults = results.filter(result => {
    const matchesSearch = 
      searchQuery === '' || 
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.achievementId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'passed' && result.success) ||
      (statusFilter === 'failed' && !result.success);
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      result.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'recent':
        comparison = new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime();
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'duration':
        comparison = a.testDurationMs - b.testDurationMs;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'rank':
        comparison = a.rank.localeCompare(b.rank);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Filter displayed results based on tab
  const displayedResults = activeTab === 'all' 
    ? sortedResults 
    : activeTab === 'passed' 
      ? sortedResults.filter(r => r.success) 
      : sortedResults.filter(r => !r.success);
  
  return (
    <div className="space-y-4">
      <Card className="bg-midnight-elevated border-divider/30">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-orbitron text-text-primary">
              Test Results ({results.length})
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearResults}
                disabled={results.length === 0}
                className="bg-midnight-card border-valor-30 text-text-primary hover:bg-valor-15"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExportResults}
                disabled={results.length === 0}
                className="bg-midnight-card border-arcane-30 text-text-primary hover:bg-arcane-15"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <TestResultFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
              onCategoryChange={setCategoryFilter}
            />
            
            <div className="flex justify-between items-center">
              <TestResultSortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={setSortBy}
                onSortOrderChange={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              />
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-midnight-card text-text-secondary">
                  {filteredResults.length} results
                </Badge>
                {passedCount > 0 && (
                  <Badge variant="outline" className="bg-green-900/20 text-green-500 border-green-900/30">
                    {passedCount} passed
                  </Badge>
                )}
                {failedCount > 0 && (
                  <Badge variant="outline" className="bg-red-900/20 text-red-500 border-red-900/30">
                    {failedCount} failed
                  </Badge>
                )}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-midnight-card">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane"
                >
                  All ({sortedResults.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="passed"
                  className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-500"
                >
                  Passed ({sortedResults.filter(r => r.success).length})
                </TabsTrigger>
                <TabsTrigger 
                  value="failed"
                  className="data-[state=active]:bg-red-900/20 data-[state=active]:text-red-500"
                >
                  Failed ({sortedResults.filter(r => !r.success).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                <ScrollArea className="h-[500px] rounded-md border border-divider/30 p-2 bg-midnight-card">
                  {displayedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-text-secondary">
                      <Filter className="h-10 w-10 mb-2 opacity-40" />
                      <p>No results match your filters</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {displayedResults.map(result => (
                        <TestResultCard 
                          key={`${result.achievementId}-${result.testedAt}`} 
                          result={result}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
