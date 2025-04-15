
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Search, Filter, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';
import { AchievementCategory } from '@/types/achievementTypes';

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
    // Text search
    const matchesSearch = 
      searchQuery === '' || 
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.achievementId.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'passed' && result.success) ||
      (statusFilter === 'failed' && !result.success);
    
    // Category filter
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Test Results ({results.length})</span>
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
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full bg-midnight-elevated border-divider"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="passed">Passed only</SelectItem>
                  <SelectItem value="failed">Failed only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.values(AchievementCategory).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-r-none border-r-0 bg-midnight-elevated border-divider">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="rank">Rank</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-none bg-midnight-elevated border-divider"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredResults.length} results
              </Badge>
              {passedCount > 0 && (
                <Badge variant="success" className="px-2">
                  {passedCount} passed
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="valor" className="px-2">
                  {failedCount} failed
                </Badge>
              )}
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({sortedResults.length})
                </TabsTrigger>
                <TabsTrigger value="passed">
                  Passed ({sortedResults.filter(r => r.success).length})
                </TabsTrigger>
                <TabsTrigger value="failed">
                  Failed ({sortedResults.filter(r => !r.success).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                <ScrollArea className="h-[500px] rounded-md border border-divider/30 p-2">
                  {displayedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-text-secondary">
                      <Filter className="h-10 w-10 mb-2 opacity-40" />
                      <p>No results match your filters</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {displayedResults.map(result => (
                        <Card key={`${result.achievementId}-${result.testedAt}`} className="p-3 hover:bg-midnight-elevated">
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
