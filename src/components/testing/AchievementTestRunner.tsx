import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AchievementTestingService, 
  AchievementTestResult, 
  AchievementTestProgress 
} from '@/services/testing/AchievementTestingService';
import { TestCoverageReport as TestCoverageReportType } from '@/services/testing/TestCoverageService';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

// Icons
import { Award, Play, CircleCheck, CircleX, Clock, Filter, RotateCcw, Save, Upload, Download, Settings, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, ChevronDown, ChevronRight, Info, Check, Trash2, Search, FilterX, ArrowDownUp } from 'lucide-react';

// Import sub-components
import AchievementTestHeader from './AchievementTestHeader';
import AchievementCategorySection from './AchievementCategorySection';
import AchievementTestItem from './AchievementTestItem';
import TestProgressIndicator from './TestProgressIndicator';
import TestResultViewer from './TestResultViewer';
import TestConfigurationPanel from './TestConfigurationPanel';
import TestCoverageReport from '@/components/achievement-testing/TestCoverageReport';
import TestingDashboard from '@/components/achievement-testing/TestingDashboard';

interface AchievementTestRunnerProps {
  userId: string;
  addLogEntry?: (action: string, details: string) => void;
}

// Local storage key for test results
const STORAGE_KEY = 'achievement-test-results';

// Filter and sort options
export type FilterOption = 'all' | 'passed' | 'failed' | 'untested';
export type SortOption = 'category' | 'rank' | 'success-rate' | 'duration';

const AchievementTestRunner: React.FC<AchievementTestRunnerProps> = ({ userId, addLogEntry }) => {
  // Service initialization
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  
  // Test state
  const [progress, setProgress] = useState<AchievementTestProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false
  });
  
  const [results, setResults] = useState<AchievementTestResult[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('category');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Configuration state
  const [useCleanup, setUseCleanup] = useState(true);
  const [useTransaction, setUseTransaction] = useState(true);
  const [verbose, setVerbose] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Category and rank filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  
  // Persist results to localStorage
  const [savedResults, setSavedResults] = useLocalStorage<AchievementTestResult[]>(STORAGE_KEY, []);
  
  // Initialize service
  useEffect(() => {
    if (userId) {
      const service = new AchievementTestingService(userId, {
        cleanup: useCleanup,
        useTransaction,
        verbose
      });
      
      service.onProgress(handleProgressUpdate);
      service.onResult(handleTestResult);
      
      setTestService(service);
      
      // Load saved results from localStorage
      if (savedResults.length > 0) {
        setResults(savedResults);
      }
    }
  }, [userId, useCleanup, useTransaction, verbose, savedResults]);
  
  // Update progress handler
  const handleProgressUpdate = useCallback((newProgress: AchievementTestProgress) => {
    setProgress(newProgress);
  }, []);
  
  // Test result handler
  const handleTestResult = useCallback((result: AchievementTestResult) => {
    setResults(prev => {
      // Replace existing result or add new one
      const newResults = prev.filter(r => r.achievementId !== result.achievementId);
      return [...newResults, result];
    });
    
    if (addLogEntry) {
      addLogEntry(
        result.success ? 'Test Passed' : 'Test Failed',
        `${result.name} (${result.category}, ${result.rank}) - ${result.success ? 'Success' : result.errorMessage}`
      );
    }
  }, [addLogEntry]);
  
  // Save results to localStorage whenever they change
  useEffect(() => {
    if (results.length > 0) {
      setSavedResults(results);
    }
  }, [results, setSavedResults]);
  
  // Get all achievements
  const allAchievements = useMemo(() => {
    return AchievementUtils.getAllAchievements().map(def => 
      AchievementUtils.convertToAchievement(def)
    );
  }, []);
  
  // Get filtered achievements based on current filters
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(achievement => {
      // Category filter
      if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
        return false;
      }
      
      // Rank filter
      if (selectedRank !== 'all' && achievement.rank !== selectedRank) {
        return false;
      }
      
      // Test status filter
      const testResult = results.find(r => r.achievementId === achievement.id);
      
      if (filter === 'passed' && (!testResult || !testResult.success)) {
        return false;
      }
      
      if (filter === 'failed' && (!testResult || testResult.success)) {
        return false;
      }
      
      if (filter === 'untested' && testResult) {
        return false;
      }
      
      // Search filter
      if (searchQuery && !achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !achievement.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [allAchievements, selectedCategory, selectedRank, filter, results, searchQuery]);
  
  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, Achievement[]> = {};
    
    // Sort achievements based on selected sort option
    const sortedAchievements = [...filteredAchievements].sort((a, b) => {
      if (sortBy === 'rank') {
        // Sort by rank (S, A, B, C, D, E)
        const rankOrder: Record<string, number> = { 'S': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'Unranked': 6 };
        return rankOrder[a.rank as string] - rankOrder[b.rank as string];
      }
      
      if (sortBy === 'success-rate') {
        // Sort by test success (passed first, then failed, then untested)
        const resultA = results.find(r => r.achievementId === a.id);
        const resultB = results.find(r => r.achievementId === b.id);
        
        if (resultA && resultB) {
          return resultA.success === resultB.success ? 0 : resultA.success ? -1 : 1;
        }
        
        if (resultA) return -1;
        if (resultB) return 1;
        return 0;
      }
      
      if (sortBy === 'duration') {
        // Sort by test duration
        const resultA = results.find(r => r.achievementId === a.id);
        const resultB = results.find(r => r.achievementId === b.id);
        
        if (resultA && resultB) {
          return resultA.testDurationMs - resultB.testDurationMs;
        }
        
        return 0;
      }
      
      // Default: sort by category
      return a.category.localeCompare(b.category);
    });
    
    // Group by category
    sortedAchievements.forEach(achievement => {
      const category = achievement.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(achievement);
    });
    
    return grouped;
  }, [filteredAchievements, sortBy, results]);
  
  // Stats for dashboard
  const stats = useMemo(() => {
    const totalAchievements = allAchievements.length;
    const testedAchievements = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;
    const coveragePercentage = totalAchievements > 0 ? (testedAchievements / totalAchievements) * 100 : 0;
    
    return {
      totalAchievements,
      testedAchievements,
      passedTests,
      failedTests,
      coveragePercentage
    };
  }, [allAchievements, results]);
  
  // Get test coverage report
  const coverageReport = useMemo(() => {
    return testService?.getTestReport().summary.coverage;
  }, [testService, results]);
  
  // Handler for running tests for a single achievement
  const runSingleTest = async (achievementId: string) => {
    if (!testService) return;
    
    setLoading(true);
    
    try {
      const result = await testService.testAchievement(achievementId);
      
      // Update results
      setResults(prev => {
        const newResults = prev.filter(r => r.achievementId !== achievementId);
        return [...newResults, result];
      });
      
      if (addLogEntry) {
        addLogEntry(
          result.success ? 'Test Passed' : 'Test Failed',
          `${result.name} (${result.category}, ${result.rank}) - ${result.success ? 'Success' : result.errorMessage}`
        );
      }
      
      toast(result.success ? 'Test passed' : 'Test failed', {
        description: result.name,
        position: 'top-right',
        duration: 3000,
        icon: result.success ? <CheckCircle2 className="text-success" /> : <XCircle className="text-valor" />
      });
    } catch (error) {
      console.error('Error running test:', error);
      toast.error('Error running test', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for running tests for selected achievements
  const runSelectedTests = async () => {
    if (!testService || selectedAchievements.length === 0) return;
    
    setLoading(true);
    setResults(prev => prev.filter(r => !selectedAchievements.includes(r.achievementId)));
    
    try {
      const previousConfig = { ...testService.updateConfig };
      testService.updateConfig({
        includedAchievements: selectedAchievements
      });
      
      const response = await testService.runAllTests();
      
      if (!response.success) {
        toast.error('Test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      }
      
      // Restore previous config
      testService.updateConfig(previousConfig);
      
      toast.success('Selected tests completed', {
        description: `Ran ${selectedAchievements.length} tests`
      });
      
      // Clear selection
      setSelectedAchievements([]);
    } catch (error) {
      console.error('Error running selected tests:', error);
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for running tests for a category
  const runCategoryTests = async (category: AchievementCategory) => {
    if (!testService) return;
    
    setLoading(true);
    
    try {
      const response = await testService.runCategoryTests(category);
      
      if (!response.success) {
        toast.error('Category test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      } else {
        toast.success('Category tests completed', {
          description: `Ran tests for ${category} category`
        });
      }
    } catch (error) {
      console.error('Error running category tests:', error);
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for running tests for a rank
  const runRankTests = async (rank: AchievementRank) => {
    if (!testService) return;
    
    setLoading(true);
    
    try {
      const response = await testService.runRankTests(rank);
      
      if (!response.success) {
        toast.error('Rank test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      } else {
        toast.success('Rank tests completed', {
          description: `Ran tests for Rank ${rank}`
        });
      }
    } catch (error) {
      console.error('Error running rank tests:', error);
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for running all tests
  const runAllTests = async () => {
    if (!testService) return;
    
    setLoading(true);
    
    try {
      const response = await testService.runAllTests();
      
      if (!response.success) {
        toast.error('Test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      } else {
        toast.success('All tests completed', {
          description: `Ran ${allAchievements.length} tests`
        });
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for clearing all results
  const clearAllResults = () => {
    setResults([]);
    setSavedResults([]);
    toast.info('Test results cleared');
  };
  
  // Handler for toggling achievement selection
  const toggleAchievementSelection = (achievementId: string) => {
    setSelectedAchievements(prev => {
      if (prev.includes(achievementId)) {
        return prev.filter(id => id !== achievementId);
      } else {
        return [...prev, achievementId];
      }
    });
  };
  
  // Handler for toggling category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  // Handler for updating test configuration
  const updateTestConfig = () => {
    if (!testService) return;
    
    testService.updateConfig({
      cleanup: useCleanup,
      useTransaction,
      verbose
    });
    
    toast.info('Test configuration updated', {
      description: `Cleanup: ${useCleanup ? 'Yes' : 'No'}, Transactions: ${useTransaction ? 'Yes' : 'No'}`
    });
  };
  
  // Handler for exporting test results
  const exportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }
    
    const testReport = testService?.getTestReport();
    const dataToExport = {
      results,
      summary: testReport?.summary,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `achievement-test-results-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast.success('Results exported successfully');
  };
  
  // Render dashboard tab
  const renderDashboard = () => {
    return (
      <TestingDashboard
        stats={{
          totalAchievements: stats.totalAchievements,
          testedAchievements: stats.testedAchievements,
          passedTests: stats.passedTests,
          failedTests: stats.failedTests,
          coveragePercentage: stats.coveragePercentage
        }}
        results={results}
        onRunAllTests={runAllTests}
        onRunCategoryTests={runCategoryTests}
        onClearResults={clearAllResults}
        onExportResults={exportResults}
        isLoading={loading}
      />
    );
  };
  
  // Render test runner tab
  const renderTestRunner = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64 bg-midnight-elevated border-divider"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSearchQuery('')}
                className="h-8 w-8"
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={value => setFilter(value as FilterOption)}>
              <SelectTrigger className="bg-midnight-elevated border-divider w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter</SelectLabel>
                  <SelectItem value="all">All Achievements</SelectItem>
                  <SelectItem value="passed">Passed Tests</SelectItem>
                  <SelectItem value="failed">Failed Tests</SelectItem>
                  <SelectItem value="untested">Untested</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={value => setSortBy(value as SortOption)}>
              <SelectTrigger className="bg-midnight-elevated border-divider w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort by</SelectLabel>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="success-rate">Success Rate</SelectItem>
                  <SelectItem value="duration">Test Duration</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Progress indicator */}
        {progress.isRunning && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Progress: {progress.completed}/{progress.total}</span>
              <span className="text-success">{progress.successful} passed</span>
              {progress.failed > 0 && <span className="text-valor">{progress.failed} failed</span>}
            </div>
            <Progress 
              value={progress.total ? (progress.completed / progress.total) * 100 : 0} 
              className="h-2"
            />
            {progress.currentTest && (
              <div className="text-xs text-text-secondary">
                Testing: {progress.currentTest}
              </div>
            )}
          </div>
        )}
        
        {/* Selected achievements actions */}
        {selectedAchievements.length > 0 && (
          <div className="flex items-center justify-between bg-arcane-15 border border-arcane-30 rounded-md p-2 mb-4">
            <div className="text-sm">
              {selectedAchievements.length} achievements selected
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedAchievements([])}
              >
                Clear Selection
              </Button>
              <Button 
                variant="arcane" 
                size="sm"
                onClick={runSelectedTests}
                disabled={loading}
              >
                <Play className="mr-2 h-3 w-3" />
                Run Selected
              </Button>
            </div>
          </div>
        )}
        
        {/* Achievements by category */}
        <div className="space-y-4">
          {Object.keys(achievementsByCategory).length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              No achievements match the current filters.
            </div>
          ) : (
            Object.entries(achievementsByCategory).map(([category, achievements]) => (
              <Collapsible 
                key={category} 
                open={expandedCategories.includes(category)}
                onOpenChange={() => toggleCategoryExpansion(category)}
              >
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center justify-start w-full p-2">
                      {expandedCategories.includes(category) ? 
                        <ChevronDown className="mr-2 h-4 w-4" /> : 
                        <ChevronRight className="mr-2 h-4 w-4" />}
                      <span className="font-semibold">{category}</span>
                      <Badge variant="outline" className="ml-2">
                        {achievements.length}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => runCategoryTests(category as AchievementCategory)}
                    disabled={loading}
                  >
                    Run Category
                  </Button>
                </div>
                
                <CollapsibleContent>
                  <div className="mt-2 space-y-2 pl-6">
                    {achievements.map(achievement => {
                      const testResult = results.find(r => r.achievementId === achievement.id);
                      const isSelected = selectedAchievements.includes(achievement.id);
                      
                      return (
                        <div 
                          key={achievement.id} 
                          className={`
                            flex items-center justify-between p-2 rounded-md
                            ${isSelected ? 'bg-arcane-15 border border-arcane-30' : 'border border-divider/10 hover:border-divider/30'}
                          `}
                        >
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAchievementSelection(achievement.id)}
                              className="mr-2"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium">{achievement.name}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Rank {achievement.rank}
                                </Badge>
                                {testResult && (
                                  <Badge 
                                    variant={testResult.success ? "success" : "valor"} 
                                    className="ml-2 text-xs"
                                  >
                                    {testResult.success ? 'Passed' : 'Failed'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary">{achievement.description}</p>
                              
                              {testResult && !testResult.success && (
                                <p className="text-xs text-valor mt-1">{testResult.errorMessage}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {testResult && (
                              <Badge 
                                variant="outline" 
                                className="text-xs flex items-center"
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                {testResult.testDurationMs}ms
                              </Badge>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => runSingleTest(achievement.id)}
                              disabled={loading}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Render results tab
  const renderResults = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllResults}
              disabled={results.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Results
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportResults}
              disabled={results.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-semibold">{results.length}</div>
                <div className="text-sm text-text-secondary">Total Tests</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-success">
                  {results.filter(r => r.success).length}
                </div>
                <div className="text-sm text-text-secondary">Passing Tests</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-valor">
                  {results.filter(r => !r.success).length}
                </div>
                <div className="text-sm text-text-secondary">Failing Tests</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Search results..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-64 bg-midnight-elevated border-divider"
          />
          <Select value={filter} onValueChange={value => setFilter(value as FilterOption)}>
            <SelectTrigger className="bg-midnight-elevated border-divider w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter</SelectLabel>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="passed">Passed Tests</SelectItem>
                <SelectItem value="failed">Failed Tests</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <ScrollArea className="h-[500px] border border-divider/20 rounded-md">
          <table className="w-full">
            <thead className="sticky top-0 bg-midnight-card">
              <tr>
                <th className="p-3 text-left">Achievement</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Rank</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left">Error</th>
              </tr>
            </thead>
            <tbody>
              {results
                .filter(result => {
                  if (filter === 'passed') return result.success;
                  if (filter === 'failed') return !result.success;
                  if (searchQuery) {
                    return result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           result.category.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (result.errorMessage && result.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()));
                  }
                  return true;
                })
                .map(result => (
                  <tr key={result.achievementId} className="border-b border-divider/10">
                    <td className="p-3">{result.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{result.category}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">Rank {result.rank}</Badge>
                    </td>
                    <td className="p-3">
                      {result.success ? (
                        <Badge variant="success" className="flex items-center">
                          <Check className="mr-1 h-3 w-3" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="valor" className="flex items-center">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant="outline" 
                        className="text-xs flex items-center"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {result.testDurationMs}ms
                      </Badge>
                    </td>
                    <td className="p-3 max-w-xs">
                      {result.errorMessage && (
                        <div className="text-xs text-valor truncate" title={result.errorMessage}>
                          {result.errorMessage}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    );
  };
  
  // Render configuration tab
  const renderConfiguration = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Configuration</CardTitle>
            <CardDescription>
              Configure how tests are executed and what happens after each test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cleanup" className="cursor-pointer">Cleanup After Tests</Label>
                <Switch 
                  id="cleanup" 
                  checked={useCleanup}
                  onCheckedChange={setUseCleanup}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-text-secondary">
                When enabled, test data will be cleaned up after each test to prevent interference between tests
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="transaction" className="cursor-pointer">Use Transactions</Label>
                <Switch 
                  id="transaction" 
                  checked={useTransaction}
                  onCheckedChange={setUseTransaction}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-text-secondary">
                When enabled, each test will run in a database transaction for better isolation
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="verbose" className="cursor-pointer">Verbose Logging</Label>
                <Switch 
                  id="verbose" 
                  checked={verbose}
                  onCheckedChange={setVerbose}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-text-secondary">
                Enable detailed logging to console during test execution
              </p>
            </div>
            
            <Button 
              variant="outline"
              className="w-full mt-4"
              onClick={updateTestConfig}
              disabled={loading}
            >
              <Settings className="mr-2 h-4 w-4" />
              Update Configuration
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>
              Manage test results and exported data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={clearAllResults}
                disabled={results.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Saved Results
              </Button>
              
              <Button 
                variant="outline"
                onClick={exportResults}
                disabled={results.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">User ID:</span>
                <span className="font-mono">{userId || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Test Service Status:</span>
                <Badge variant={testService ? "success" : "valor"}>
                  {testService ? 'Ready' : 'Not Initialized'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Saved Results:</span>
                <span>{results.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Award className="mr-2 h-5 w-5 text-arcane" />
          Achievement Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4 bg-midnight-card border border-divider/30 shadow-subtle">
            <TabsTrigger value="dashboard" className="flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="runner" className="flex items-center">
              <Play className="mr-2 h-4 w-4" />
              Test Runner
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-0">
            {renderDashboard()}
          </TabsContent>
          
          <TabsContent value="runner" className="mt-0">
            {renderTestRunner()}
          </TabsContent>
          
          <TabsContent value="results" className="mt-0">
            {renderResults()}
          </TabsContent>
          
          <TabsContent value="config" className="mt-0">
            {renderConfiguration()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AchievementTestRunner;
