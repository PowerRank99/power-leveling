
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger,
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
  Switch,
  Badge,
  Progress,
  ScrollArea,
  Separator,
  Alert, AlertTitle, AlertDescription
} from '@/components/ui';
import {
  PlayCircle,
  StopCircle,
  Trash2,
  Download,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Filter,
  SlidersHorizontal,
  Award,
  AlertTriangle,
  RotateCcw,
  Save,
  Layers,
  Search
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  AchievementTestingService,
  AchievementTestResult,
  AchievementTestProgress,
  AchievementTestConfig
} from '@/services/testing/AchievementTestingService';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { TestCoverageReport as TestCoverageReportType } from '@/services/testing/TestCoverageService';
import TestCoverageReport from '@/components/achievement-testing/TestCoverageReport';
import { toast } from 'sonner';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import TestResultViewer from './TestResultViewer';
import TestConfigurationPanel from './TestConfigurationPanel';
import AchievementCategorySection from './AchievementCategorySection';
import AchievementTestItem from './AchievementTestItem';
import TestProgressIndicator from './TestProgressIndicator';
import { useLocalStorage } from './hooks/useLocalStorage';

// Storage keys for localStorage
const STORAGE_KEYS = {
  TEST_RESULTS: 'achievement-test-results',
  TEST_CONFIG: 'achievement-test-config',
  SELECTED_TAB: 'achievement-test-selected-tab',
  FILTER_OPTIONS: 'achievement-test-filter-options',
  SORT_OPTIONS: 'achievement-test-sort-options'
};

interface FilterOptions {
  category: string;
  rank: string;
  status: 'all' | 'passed' | 'failed' | 'untested';
  search: string;
}

interface SortOptions {
  field: 'category' | 'rank' | 'success' | 'duration';
  direction: 'asc' | 'desc';
}

interface AchievementTestRunnerProps {
  userId: string;
  addLogEntry?: (action: string, details: string) => void;
}

const AchievementTestRunner: React.FC<AchievementTestRunnerProps> = ({ userId, addLogEntry }) => {
  // Reference to testing service
  const testServiceRef = useRef<AchievementTestingService | null>(null);
  
  // Progress state
  const [progress, setProgress] = useState<AchievementTestProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false
  });
  
  // Test results and configuration
  const [results, setResults] = useLocalStorage<AchievementTestResult[]>(STORAGE_KEYS.TEST_RESULTS, []);
  const [coverage, setCoverage] = useState<TestCoverageReportType | null>(null);
  const [loading, setLoading] = useState(false);
  
  // UI state
  const [selectedTab, setSelectedTab] = useLocalStorage<string>(STORAGE_KEYS.SELECTED_TAB, 'dashboard');
  const [filterOptions, setFilterOptions] = useLocalStorage<FilterOptions>(STORAGE_KEYS.FILTER_OPTIONS, {
    category: 'all',
    rank: 'all',
    status: 'all',
    search: ''
  });
  const [sortOptions, setSortOptions] = useLocalStorage<SortOptions>(STORAGE_KEYS.SORT_OPTIONS, {
    field: 'category',
    direction: 'asc'
  });
  
  // Test configuration
  const [testConfig, setTestConfig] = useLocalStorage<Partial<AchievementTestConfig>>(STORAGE_KEYS.TEST_CONFIG, {
    cleanup: true,
    useTransaction: true,
    verbose: true,
    timeout: 10000,
    maxRetries: 3
  });
  
  // Get all achievements
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
  
  // Initialize test service when userId changes
  useEffect(() => {
    if (userId) {
      const service = new AchievementTestingService(userId, testConfig);
      
      service.onProgress(handleProgressUpdate);
      service.onResult(handleTestResult);
      
      testServiceRef.current = service;
      
      // Load all achievements
      const achievements = AchievementUtils.getAllAchievements();
      setAllAchievements(achievements);
    }
  }, [userId, testConfig]);
  
  // Handle progress updates
  const handleProgressUpdate = useCallback((newProgress: AchievementTestProgress) => {
    setProgress(newProgress);
  }, []);
  
  // Handle test results
  const handleTestResult = useCallback((result: AchievementTestResult) => {
    setResults(prev => {
      // Remove any existing result for the same achievement
      const filtered = prev.filter(r => r.achievementId !== result.achievementId);
      return [...filtered, result];
    });
    
    if (addLogEntry) {
      addLogEntry(
        result.success ? 'Test Passed' : 'Test Failed',
        `${result.name} (${result.category}, ${result.rank}) - ${result.success ? 'Success' : result.errorMessage}`
      );
    }
  }, [addLogEntry, setResults]);
  
  // Run all tests
  const runAllTests = async () => {
    if (!testServiceRef.current) return;
    
    setLoading(true);
    
    try {
      const response = await testServiceRef.current.runAllTests();
      
      if (!response.success) {
        toast.error('Test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      } else {
        toast.success('Test run completed', {
          description: `Completed ${response.data.length} tests`
        });
      }
      
      updateCoverageReport();
      
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run tests for a specific category
  const runCategoryTests = async (category: AchievementCategory) => {
    if (!testServiceRef.current) return;
    
    setLoading(true);
    
    try {
      const response = await testServiceRef.current.runCategoryTests(category);
      
      if (!response.success) {
        toast.error('Category test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      } else {
        toast.success('Category test run completed', {
          description: `Completed ${response.data.length} tests for ${category}`
        });
      }
      
      updateCoverageReport();
      
    } catch (error) {
      console.error('Error running category tests:', error);
      toast.error('Error running category tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run tests for a specific rank
  const runRankTests = async (rank: AchievementRank) => {
    if (!testServiceRef.current) return;
    
    setLoading(true);
    
    try {
      const response = await testServiceRef.current.runRankTests(rank);
      
      if (!response.success) {
        toast.error('Rank test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      } else {
        toast.success('Rank test run completed', {
          description: `Completed ${response.data.length} tests for Rank ${rank}`
        });
      }
      
      updateCoverageReport();
      
    } catch (error) {
      console.error('Error running rank tests:', error);
      toast.error('Error running rank tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run tests for selected achievements
  const runSelectedTests = async () => {
    if (!testServiceRef.current || selectedAchievements.length === 0) return;
    
    setLoading(true);
    
    try {
      // Configure test service to only test selected achievements
      testServiceRef.current.updateConfig({
        ...testConfig,
        includedAchievements: selectedAchievements
      });
      
      const response = await testServiceRef.current.runAllTests();
      
      if (!response.success) {
        toast.error('Selected tests run failed', {
          description: response.error?.message || 'Unknown error'
        });
      } else {
        toast.success('Selected tests run completed', {
          description: `Completed ${response.data.length} selected tests`
        });
      }
      
      // Reset the included achievements filter
      testServiceRef.current.updateConfig({
        ...testConfig,
        includedAchievements: undefined
      });
      
      updateCoverageReport();
      
    } catch (error) {
      console.error('Error running selected tests:', error);
      toast.error('Error running selected tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run test for a single achievement
  const runSingleTest = async (achievementId: string) => {
    if (!testServiceRef.current) return;
    
    setLoading(true);
    
    try {
      const result = await testServiceRef.current.testAchievement(achievementId);
      
      if (result.success) {
        toast.success(`Test passed: ${result.name}`, {
          description: `Duration: ${result.testDurationMs}ms`
        });
      } else {
        toast.error(`Test failed: ${result.name}`, {
          description: result.errorMessage || 'Unknown error'
        });
      }
      
      updateCoverageReport();
      
    } catch (error) {
      console.error('Error running single test:', error);
      toast.error('Error running single test', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update test configuration
  const updateTestConfig = (newConfig: Partial<AchievementTestConfig>) => {
    setTestConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
    
    if (testServiceRef.current) {
      testServiceRef.current.updateConfig(newConfig);
      
      toast.info('Test configuration updated', {
        description: `Configuration successfully updated`
      });
    }
  };
  
  // Update coverage report
  const updateCoverageReport = useCallback(() => {
    if (testServiceRef.current) {
      const report = testServiceRef.current.getTestReport();
      setCoverage(report.summary.coverage);
    }
  }, []);
  
  // Clear test results
  const clearResults = () => {
    setResults([]);
    toast.info('Test results cleared');
  };
  
  // Toggle achievement selection
  const toggleAchievementSelection = (achievementId: string) => {
    setSelectedAchievements(prev => {
      if (prev.includes(achievementId)) {
        return prev.filter(id => id !== achievementId);
      } else {
        return [...prev, achievementId];
      }
    });
  };
  
  // Select all achievements
  const selectAllAchievements = () => {
    const allIds = allAchievements.map(a => a.id);
    setSelectedAchievements(allIds);
  };
  
  // Deselect all achievements
  const deselectAllAchievements = () => {
    setSelectedAchievements([]);
  };
  
  // Export test results as JSON
  const exportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }
    
    const dataStr = JSON.stringify({
      results,
      coverage,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `achievement-test-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast.success('Results exported', {
      description: `File: ${exportFileName}`
    });
  };
  
  // Apply filters to achievement list
  const getFilteredAchievements = useCallback(() => {
    return allAchievements.filter(achievement => {
      // Filter by category
      if (filterOptions.category !== 'all' && achievement.category !== filterOptions.category) {
        return false;
      }
      
      // Filter by rank
      if (filterOptions.rank !== 'all' && achievement.rank !== filterOptions.rank) {
        return false;
      }
      
      // Filter by status
      if (filterOptions.status !== 'all') {
        const testResult = results.find(r => r.achievementId === achievement.id);
        
        if (filterOptions.status === 'passed' && (!testResult || !testResult.success)) {
          return false;
        }
        
        if (filterOptions.status === 'failed' && (!testResult || testResult.success)) {
          return false;
        }
        
        if (filterOptions.status === 'untested' && testResult) {
          return false;
        }
      }
      
      // Filter by search
      if (filterOptions.search) {
        const searchLower = filterOptions.search.toLowerCase();
        return (
          achievement.name.toLowerCase().includes(searchLower) ||
          achievement.description.toLowerCase().includes(searchLower) ||
          achievement.id.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [allAchievements, filterOptions, results]);
  
  // Sort filtered achievements
  const getSortedAchievements = useCallback(() => {
    const filtered = getFilteredAchievements();
    
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOptions.field) {
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'rank':
          comparison = a.rank.localeCompare(b.rank);
          break;
        case 'success': {
          const resultA = results.find(r => r.achievementId === a.id);
          const resultB = results.find(r => r.achievementId === b.id);
          const successA = resultA?.success || false;
          const successB = resultB?.success || false;
          comparison = successA === successB ? 0 : successA ? -1 : 1;
          break;
        }
        case 'duration': {
          const resultA = results.find(r => r.achievementId === a.id);
          const resultB = results.find(r => r.achievementId === b.id);
          const durationA = resultA?.testDurationMs || Infinity;
          const durationB = resultB?.testDurationMs || Infinity;
          comparison = durationA - durationB;
          break;
        }
      }
      
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });
  }, [getFilteredAchievements, results, sortOptions]);
  
  // Group achievements by category
  const getAchievementsByCategory = useCallback(() => {
    const sorted = getSortedAchievements();
    const grouped: Record<string, any[]> = {};
    
    sorted.forEach(achievement => {
      const category = achievement.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(achievement);
    });
    
    return grouped;
  }, [getSortedAchievements]);
  
  // Update search filter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions(prev => ({
      ...prev,
      search: e.target.value
    }));
  };
  
  // Update category filter
  const handleCategoryChange = (value: string) => {
    setFilterOptions(prev => ({
      ...prev,
      category: value
    }));
  };
  
  // Update rank filter
  const handleRankChange = (value: string) => {
    setFilterOptions(prev => ({
      ...prev,
      rank: value
    }));
  };
  
  // Update status filter
  const handleStatusChange = (value: 'all' | 'passed' | 'failed' | 'untested') => {
    setFilterOptions(prev => ({
      ...prev,
      status: value
    }));
  };
  
  // Update sort options
  const handleSortChange = (field: SortOptions['field']) => {
    setSortOptions(prev => {
      if (prev.field === field) {
        // Toggle direction if same field
        return {
          ...prev,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // Set new field with default ascending direction
        return {
          field,
          direction: 'asc'
        };
      }
    });
  };
  
  // Render Dashboard view
  const renderDashboard = () => {
    const categoryStats: Record<string, { total: number, tested: number, passed: number, failed: number }> = {};
    
    // Calculate statistics
    allAchievements.forEach(achievement => {
      const category = achievement.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, tested: 0, passed: 0, failed: 0 };
      }
      
      categoryStats[category].total++;
      
      const testResult = results.find(r => r.achievementId === achievement.id);
      if (testResult) {
        categoryStats[category].tested++;
        if (testResult.success) {
          categoryStats[category].passed++;
        } else {
          categoryStats[category].failed++;
        }
      }
    });
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{allAchievements.length}</div>
              <p className="text-text-secondary">Total Achievements</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-arcane">{results.filter(r => r.success).length}</div>
              <p className="text-text-secondary">Passing Tests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-valor">{results.filter(r => !r.success).length}</div>
              <p className="text-text-secondary">Failing Tests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-achievement">{allAchievements.length - results.length}</div>
              <p className="text-text-secondary">Untested Achievements</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Testing Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall test coverage */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Test Coverage</h3>
                  <span>
                    {results.length} / {allAchievements.length} tested 
                    ({Math.round((results.length / allAchievements.length) * 100) || 0}%)
                  </span>
                </div>
                <Progress value={(results.length / allAchievements.length) * 100 || 0} className="h-2" />
              </div>
              
              {/* Category breakdown */}
              <div>
                <h3 className="font-semibold mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(categoryStats).map(([category, stats]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center">
                          <BadgeComponent variant="outline" className="mr-2">
                            {category}
                          </BadgeComponent>
                          <span className="text-sm text-text-secondary">{stats.total} achievements</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-sm text-arcane">{stats.passed} passed</span>
                          {stats.failed > 0 && (
                            <span className="text-sm text-valor">{stats.failed} failed</span>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={(stats.tested / stats.total) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button 
                  variant="arcane" 
                  onClick={() => {
                    setSelectedTab('test-runner');
                    setTimeout(runAllTests, 100);
                  }}
                  disabled={loading || !userId}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run All Tests
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => setSelectedTab('test-runner')}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Test Runner
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setSelectedTab('results')}
                  disabled={results.length === 0}
                >
                  <Search className="mr-2 h-4 w-4" />
                  View Results
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
            </div>
          </CardContent>
        </Card>
        
        {/* Recent test results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {results.slice(-10).reverse().map((result) => (
                    <div 
                      key={result.achievementId}
                      className="p-3 border border-divider/20 rounded-md flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        {result.success ? (
                          <CircleCheck className="h-5 w-5 text-success mr-3" />
                        ) : (
                          <CircleX className="h-5 w-5 text-valor mr-3" />
                        )}
                        <div>
                          <p className="font-medium">{result.name}</p>
                          <div className="flex items-center text-text-secondary text-xs">
                            <BadgeComponent variant="outline" className="mr-1 px-1 py-0 text-xs">
                              {result.category}
                            </BadgeComponent>
                            <BadgeComponent variant="outline" className="mr-1 px-1 py-0 text-xs">
                              Rank {result.rank}
                            </BadgeComponent>
                            <Clock className="h-3 w-3 mr-1 ml-1" />
                            <span>{result.testDurationMs}ms</span>
                          </div>
                        </div>
                      </div>
                      {!result.success && (
                        <div className="text-valor text-sm max-w-[40%] text-right">
                          {result.errorMessage?.substring(0, 60)}{result.errorMessage && result.errorMessage.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        
        {/* Coverage report if available */}
        {coverage && (
          <TestCoverageReport coverage={coverage} />
        )}
      </div>
    );
  };
  
  // Render Test Runner view
  const renderTestRunner = () => {
    const achievementsByCategory = getAchievementsByCategory();
    
    return (
      <div className="space-y-6">
        {/* Test controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Controls</span>
              {progress.isRunning && (
                <BadgeComponent variant="arcane" className="animate-pulse">
                  Running Tests...
                </BadgeComponent>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress bar */}
              {progress.isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {progress.completed}/{progress.total}</span>
                    <div className="space-x-2">
                      <span className="text-arcane">{progress.successful} passed</span>
                      {progress.failed > 0 && (
                        <span className="text-valor">{progress.failed} failed</span>
                      )}
                    </div>
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
              
              {/* Action buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="arcane"
                  onClick={runAllTests}
                  disabled={loading || !userId || progress.isRunning}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  All Tests
                </Button>
                
                <Button
                  variant="outline"
                  onClick={runSelectedTests}
                  disabled={loading || !userId || progress.isRunning || selectedAchievements.length === 0}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Selected ({selectedAchievements.length})
                </Button>
                
                <Button
                  variant="outline"
                  onClick={clearResults}
                  disabled={results.length === 0 || progress.isRunning}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Results
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setSelectedTab('configuration')}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
              
              {/* Selection controls */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={selectAllAchievements}
                  className="text-text-secondary"
                >
                  Select All
                </Button>
                
                <Button
                  variant="link"
                  size="sm"
                  onClick={deselectAllAchievements}
                  className="text-text-secondary"
                  disabled={selectedAchievements.length === 0}
                >
                  Deselect All
                </Button>
                
                {selectedAchievements.length > 0 && (
                  <BadgeComponent variant="outline">
                    {selectedAchievements.length} selected
                  </BadgeComponent>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search achievements..."
                  value={filterOptions.search}
                  onChange={handleSearchChange}
                  className="bg-midnight-elevated"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={filterOptions.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category" className="bg-midnight-elevated">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.values(AchievementCategory).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rank">Rank</Label>
                <Select value={filterOptions.rank} onValueChange={handleRankChange}>
                  <SelectTrigger id="rank" className="bg-midnight-elevated">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    {Object.values(AchievementRank).map(rank => (
                      <SelectItem key={rank} value={rank}>
                        Rank {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={filterOptions.status} 
                  onValueChange={(value) => handleStatusChange(value as any)}
                >
                  <SelectTrigger id="status" className="bg-midnight-elevated">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="untested">Untested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievement categories */}
        <div className="space-y-4">
          {Object.entries(achievementsByCategory).map(([category, achievements]) => (
            <Collapsible key={category}>
              <Card>
                <CollapsibleTrigger className="w-full text-left p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <ChevronRight className="h-5 w-5 mr-2 transition-transform data-[state=open]:rotate-90" />
                    <h3 className="font-semibold">{category}</h3>
                    <BadgeComponent variant="outline" className="ml-2">
                      {achievements.length}
                    </BadgeComponent>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        runCategoryTests(category as AchievementCategory);
                      }}
                      disabled={loading || progress.isRunning}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4">
                    <div className="space-y-2">
                      {achievements.map(achievement => {
                        const testResult = results.find(r => r.achievementId === achievement.id);
                        const isSelected = selectedAchievements.includes(achievement.id);
                        
                        return (
                          <div 
                            key={achievement.id}
                            className={`p-3 border rounded-md flex items-center justify-between ${
                              isSelected ? 'border-arcane-30 bg-arcane-15' : 'border-divider/20'
                            }`}
                          >
                            <div className="flex items-center">
                              <div 
                                className="mr-3 cursor-pointer"
                                onClick={() => toggleAchievementSelection(achievement.id)}
                              >
                                {isSelected ? (
                                  <div className="h-5 w-5 rounded border-2 border-arcane bg-arcane-30 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-arcane" />
                                  </div>
                                ) : (
                                  <div className="h-5 w-5 rounded border-2 border-divider"></div>
                                )}
                              </div>
                              
                              <div>
                                <p className="font-medium">{achievement.name}</p>
                                <div className="flex items-center text-text-secondary text-xs">
                                  <BadgeComponent variant="outline" className="mr-1 px-1 py-0 text-xs">
                                    Rank {achievement.rank}
                                  </BadgeComponent>
                                  <span className="ml-1 text-xs">
                                    {achievement.requirementType}: {achievement.requirementValue}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {testResult && (
                                <div className="flex items-center mr-2">
                                  {testResult.success ? (
                                    <BadgeComponent variant="arcane" className="px-1 py-0 text-xs">
                                      <CircleCheck className="h-3 w-3 mr-1" />
                                      {testResult.testDurationMs}ms
                                    </BadgeComponent>
                                  ) : (
                                    <BadgeComponent variant="valor" className="px-1 py-0 text-xs">
                                      <CircleX className="h-3 w-3 mr-1" />
                                      Failed
                                    </BadgeComponent>
                                  )}
                                </div>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => runSingleTest(achievement.id)}
                                disabled={loading || progress.isRunning}
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
          
          {Object.keys(achievementsByCategory).length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No achievements found</AlertTitle>
              <AlertDescription>
                Try changing your filters to see more achievements.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };
  
  // Render Results view
  const renderResults = () => {
    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-text-secondary mb-4" />
          <h3 className="text-lg font-medium mb-2">No Test Results</h3>
          <p className="text-text-secondary">Run some tests to see results here.</p>
          <Button 
            variant="arcane" 
            className="mt-4"
            onClick={() => setSelectedTab('test-runner')}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Go to Test Runner
          </Button>
        </div>
      );
    }
    
    // Calculate result statistics
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;
    const passRate = (passedTests / totalTests) * 100;
    
    // Sort results based on current sort options
    const sortedResults = [...results].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOptions.field) {
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'rank':
          comparison = a.rank.localeCompare(b.rank);
          break;
        case 'success':
          comparison = (a.success === b.success) ? 0 : a.success ? -1 : 1;
          break;
        case 'duration':
          comparison = a.testDurationMs - b.testDurationMs;
          break;
      }
      
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalTests}</div>
                  <p className="text-text-secondary">Total Tests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-arcane">{passedTests}</div>
                  <p className="text-text-secondary">Passing Tests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-valor">{failedTests}</div>
                  <p className="text-text-secondary">Failing Tests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-achievement">{passRate.toFixed(1)}%</div>
                  <p className="text-text-secondary">Pass Rate</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant="outline"
                onClick={() => handleStatusChange('all')}
                className={filterOptions.status === 'all' ? 'border-arcane-30' : ''}
              >
                All Results
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('passed')}
                className={filterOptions.status === 'passed' ? 'border-arcane-30' : ''}
              >
                <CircleCheck className="mr-2 h-4 w-4 text-arcane" />
                Passing
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('failed')}
                className={filterOptions.status === 'failed' ? 'border-arcane-30' : ''}
              >
                <CircleX className="mr-2 h-4 w-4 text-valor" />
                Failing
              </Button>
              <Button
                variant="outline"
                onClick={clearResults}
                className="ml-auto"
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={exportResults}
                disabled={loading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-midnight-elevated p-3 border-b border-divider/20 grid grid-cols-10 gap-2 text-text-secondary text-sm font-medium">
                <div className="col-span-4 flex items-center gap-1 cursor-pointer" onClick={() => handleSortChange('category')}>
                  <span>Achievement</span>
                  {sortOptions.field === 'category' && (
                    <ChevronDown className={`h-4 w-4 ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSortChange('rank')}>
                  <span>Rank</span>
                  {sortOptions.field === 'rank' && (
                    <ChevronDown className={`h-4 w-4 ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSortChange('success')}>
                  <span>Status</span>
                  {sortOptions.field === 'success' && (
                    <ChevronDown className={`h-4 w-4 ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSortChange('duration')}>
                  <span>Duration</span>
                  {sortOptions.field === 'duration' && (
                    <ChevronDown className={`h-4 w-4 ${sortOptions.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-divider/20">
                  {sortedResults.map(result => (
                    <div 
                      key={result.achievementId} 
                      className="p-3 grid grid-cols-10 gap-2 items-center hover:bg-midnight-elevated cursor-pointer"
                      onClick={() => runSingleTest(result.achievementId)}
                    >
                      <div className="col-span-4">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-text-secondary">{result.category}</div>
                      </div>
                      <div className="col-span-2">
                        <BadgeComponent variant="outline">{result.rank}</BadgeComponent>
                      </div>
                      <div className="col-span-2">
                        {result.success ? (
                          <BadgeComponent variant="arcane" className="px-2 py-0.5 text-xs">
                            <CircleCheck className="h-3 w-3 mr-1" />
                            Passed
                          </BadgeComponent>
                        ) : (
                          <BadgeComponent variant="valor" className="px-2 py-0.5 text-xs">
                            <CircleX className="h-3 w-3 mr-1" />
                            Failed
                          </BadgeComponent>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center text-text-secondary">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{result.testDurationMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
        
        {/* Coverage report if available */}
        {coverage && (
          <TestCoverageReport coverage={coverage} />
        )}
      </div>
    );
  };
  
  // Render Configuration view
  const renderConfiguration = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Test Behavior</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cleanup" className="block mb-1">Cleanup After Tests</Label>
                  <p className="text-text-secondary text-sm">Remove test data after each test</p>
                </div>
                <Switch
                  id="cleanup"
                  checked={testConfig.cleanup}
                  onCheckedChange={(checked) => updateTestConfig({ cleanup: checked })}
                  disabled={loading || progress.isRunning}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="useTransaction" className="block mb-1">Use Transactions</Label>
                  <p className="text-text-secondary text-sm">Run tests in database transactions</p>
                </div>
                <Switch
                  id="useTransaction"
                  checked={testConfig.useTransaction}
                  onCheckedChange={(checked) => updateTestConfig({ useTransaction: checked })}
                  disabled={loading || progress.isRunning}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="verbose" className="block mb-1">Verbose Logging</Label>
                  <p className="text-text-secondary text-sm">Log detailed test information</p>
                </div>
                <Switch
                  id="verbose"
                  checked={testConfig.verbose}
                  onCheckedChange={(checked) => updateTestConfig({ verbose: checked })}
                  disabled={loading || progress.isRunning}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Advanced Settings</h3>
              
              <div>
                <Label htmlFor="timeout" className="block mb-1">Test Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={testConfig.timeout}
                  onChange={(e) => updateTestConfig({ timeout: parseInt(e.target.value) })}
                  className="bg-midnight-elevated"
                  disabled={loading || progress.isRunning}
                />
                <p className="text-text-secondary text-sm mt-1">Maximum time allowed for each test</p>
              </div>
              
              <div>
                <Label htmlFor="maxRetries" className="block mb-1">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  value={testConfig.maxRetries}
                  onChange={(e) => updateTestConfig({ maxRetries: parseInt(e.target.value) })}
                  className="bg-midnight-elevated"
                  disabled={loading || progress.isRunning}
                />
                <p className="text-text-secondary text-sm mt-1">Number of retry attempts for failed tests</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                updateTestConfig({
                  cleanup: true,
                  useTransaction: true,
                  verbose: true,
                  timeout: 10000,
                  maxRetries: 3
                });
              }}
              disabled={loading || progress.isRunning}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <Button
              variant="arcane"
              onClick={() => updateTestConfig(testConfig)}
              disabled={loading || progress.isRunning}
            >
              <Save className="mr-2 h-4 w-4" />
              Apply Settings
            </Button>
          </div>
          
          {/* Local Storage Management */}
          <div className="mt-8 pt-4 border-t border-divider/20">
            <h3 className="font-semibold mb-4">Local Storage Management</h3>
            <p className="text-text-secondary mb-4">
              Test results are saved to your browser's local storage. You can clear this data below.
            </p>
            
            <Button
              variant="valor"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEYS.TEST_RESULTS);
                localStorage.removeItem(STORAGE_KEYS.TEST_CONFIG);
                localStorage.removeItem(STORAGE_KEYS.SELECTED_TAB);
                localStorage.removeItem(STORAGE_KEYS.FILTER_OPTIONS);
                localStorage.removeItem(STORAGE_KEYS.SORT_OPTIONS);
                
                toast.success('Local storage cleared', {
                  description: 'All test results and settings have been reset.'
                });
                
                // Reload page to reset state
                window.location.reload();
              }}
              disabled={loading || progress.isRunning}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Saved Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader>
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Award className="mr-2 h-5 w-5 text-arcane" />
          Achievement Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !progress.isRunning && (
          <LoadingSpinner message="Loading..." size="sm" className="py-4" />
        )}
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full mb-4 bg-midnight-card border border-divider/30 shadow-subtle overflow-x-auto flex-nowrap">
            <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
            <TabsTrigger value="test-runner" className="flex-1">Test Runner</TabsTrigger>
            <TabsTrigger value="results" className="flex-1">Results</TabsTrigger>
            <TabsTrigger value="configuration" className="flex-1">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>
          
          <TabsContent value="test-runner">
            {renderTestRunner()}
          </TabsContent>
          
          <TabsContent value="results">
            {renderResults()}
          </TabsContent>
          
          <TabsContent value="configuration">
            {renderConfiguration()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AchievementTestRunner;
