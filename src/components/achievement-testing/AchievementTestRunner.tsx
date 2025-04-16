import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  AchievementTestingService, 
  AchievementTestResult, 
  AchievementTestProgress,
} from '@/services/testing/AchievementTestingService';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { Award, CircleCheck, CircleX, Clock, Filter, Play, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import TestCoverageReport from './TestCoverageReport';

interface AchievementTestRunnerProps {
  userId: string;
  addLogEntry?: (action: string, details: string) => void;
}

const AchievementTestRunner: React.FC<AchievementTestRunnerProps> = ({ userId, addLogEntry }) => {
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  const [progress, setProgress] = useState<AchievementTestProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false
  });
  const [results, setResults] = useState<AchievementTestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [useCleanup, setUseCleanup] = useState(true);
  const [useTransaction, setUseTransaction] = useState(true);
  const [verbose, setVerbose] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      const service = new AchievementTestingService(userId, {
        useCleanup,
        useTransaction,
        verbose
      });
      
      service.onProgress(handleProgressUpdate);
      service.onResult(handleTestResult);
      
      setTestService(service);
    }
  }, [userId, useCleanup, useTransaction, verbose]);

  const handleProgressUpdate = (newProgress: AchievementTestProgress) => {
    setProgress(newProgress);
  };

  const handleTestResult = (result: AchievementTestResult) => {
    setResults(prev => [...prev, result]);
    
    if (addLogEntry) {
      addLogEntry(
        result.success ? 'Test Passed' : 'Test Failed',
        `${result.name} (${result.category}, ${result.rank}) - ${result.success ? 'Success' : result.errorMessage}`
      );
    }
  };

  const runTests = async () => {
    if (!testService) return;
    
    setLoading(true);
    setResults([]);
    
    try {
      let response;
      
      if (selectedCategory !== 'all') {
        response = await testService.runCategoryTests(selectedCategory as AchievementCategory);
      } else if (selectedRank !== 'all') {
        response = await testService.runRankTests(selectedRank as AchievementRank);
      } else {
        response = await testService.runAllTests();
      }
      
      if (!response.success) {
        toast.error('Test run failed', {
          description: response.error?.message || 'Unknown error'
        });
      }
      
      const report = testService.getTestReport();
      
      if (addLogEntry) {
        addLogEntry(
          'Test Run Complete',
          `Passed: ${report.summary.successful}/${report.summary.total} (${Math.round(report.summary.successRate * 100)}%)`
        );
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

  const updateTestConfig = () => {
    if (!testService) return;
    
    testService.updateConfig({
      useCleanup,
      useTransaction,
      verbose
    });
    
    toast.info('Test configuration updated', {
      description: `Cleanup: ${useCleanup ? 'Yes' : 'No'}, Transactions: ${useTransaction ? 'Yes' : 'No'}`
    });
  };

  const renderResultItem = (result: AchievementTestResult) => {
    return (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="category">Filter by Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={loading}
              >
                <SelectTrigger id="category" className="bg-midnight-elevated border-divider w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value={AchievementCategory.WORKOUT}>Workouts</SelectItem>
                    <SelectItem value={AchievementCategory.STREAK}>Streaks</SelectItem>
                    <SelectItem value={AchievementCategory.RECORD}>Records</SelectItem>
                    <SelectItem value={AchievementCategory.MANUAL}>Manual Workouts</SelectItem>
                    <SelectItem value={AchievementCategory.XP}>XP</SelectItem>
                    <SelectItem value={AchievementCategory.LEVEL}>Level</SelectItem>
                    <SelectItem value={AchievementCategory.VARIETY}>Variety</SelectItem>
                    <SelectItem value={AchievementCategory.GUILD}>Guild</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rank">Filter by Rank</Label>
              <Select
                value={selectedRank}
                onValueChange={setSelectedRank}
                disabled={loading}
              >
                <SelectTrigger id="rank" className="bg-midnight-elevated border-divider w-full">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Ranks</SelectItem>
                    <SelectItem value={AchievementRank.E}>Rank E</SelectItem>
                    <SelectItem value={AchievementRank.D}>Rank D</SelectItem>
                    <SelectItem value={AchievementRank.C}>Rank C</SelectItem>
                    <SelectItem value={AchievementRank.B}>Rank B</SelectItem>
                    <SelectItem value={AchievementRank.A}>Rank A</SelectItem>
                    <SelectItem value={AchievementRank.S}>Rank S</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
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
              
              <div className="flex items-center justify-between">
                <Label htmlFor="transaction" className="cursor-pointer">Use Transactions</Label>
                <Switch 
                  id="transaction" 
                  checked={useTransaction}
                  onCheckedChange={setUseTransaction}
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="verbose" className="cursor-pointer">Verbose Logging</Label>
                <Switch 
                  id="verbose" 
                  checked={verbose}
                  onCheckedChange={setVerbose}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="outline"
                className="w-full"
                onClick={updateTestConfig}
                disabled={loading}
              >
                <Filter className="mr-2 h-4 w-4" />
                Update Config
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
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
            
            <div className="flex space-x-2">
              <Button 
                variant="arcane"
                className="flex-1"
                onClick={runTests}
                disabled={loading || !userId}
              >
                <Play className="mr-2 h-4 w-4" />
                {loading ? 'Running Tests...' : 'Run Tests'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setResults([])}
                disabled={loading || results.length === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Results
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Test Results</h3>
              <ScrollArea className="h-[300px] rounded-md border border-divider/30">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-text-tertiary">
                    No test results yet
                  </div>
                ) : (
                  results.map(renderResultItem)
                )}
              </ScrollArea>
            </div>
            
            {results.length > 0 && testService?.getTestReport() && (
              <TestCoverageReport 
                coverage={{
                  totalAchievements: testService.getTestReport().summary.coverage.total,
                  testedAchievements: testService.getTestReport().summary.coverage.tested,
                  coveragePercentage: testService.getTestReport().summary.coverage.percentage,
                  byCategory: testService.getTestReport().summary.coverage.byCategory || {},
                  untestedAchievements: testService.getTestReport().summary.coverage.untestedAchievements || []
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementTestRunner;
