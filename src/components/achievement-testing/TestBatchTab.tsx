
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { 
  Clock, PauseCircle, PlayCircle, ListRestart, Dices, AlertTriangle, 
  Check, Repeat, CheckSquare, X, Filter, RotateCcw, Loader2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface TestBatchTabProps {
  userId: string;
}

interface TestBatchResult {
  id: string;
  name: string;
  category: string;
  rank: string;
  status: 'success' | 'failure' | 'pending';
  error?: string;
  duration?: number;
}

const TestBatchTab: React.FC<TestBatchTabProps> = ({ userId }) => {
  const { 
    allAchievements, selectedAchievements, testResults, testProgress,
    toggleAchievementSelection, selectAllVisible, clearSelection,
    filteredAchievements, runTests, stopTests, clearResults
  } = useTestingDashboard();
  
  const [activeTab, setActiveTab] = useState('configure');
  const [showSuccessful, setShowSuccessful] = useState(true);
  const [showFailed, setShowFailed] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [retryingFailed, setRetryingFailed] = useState(false);
  
  // Get batch test results
  const batchResults: TestBatchResult[] = allAchievements.map(ach => {
    const testResult = testResults.find(r => r.achievementId === ach.id);
    
    return {
      id: ach.id,
      name: ach.name,
      category: ach.category,
      rank: ach.rank,
      status: testResult 
        ? testResult.success ? 'success' : 'failure'
        : 'pending',
      error: testResult?.errorMessage,
      duration: testResult?.testDurationMs
    };
  });
  
  // Filter results based on success/failure/pending filters
  const filteredResults = batchResults.filter(result => {
    if (result.status === 'success' && !showSuccessful) return false;
    if (result.status === 'failure' && !showFailed) return false;
    if (result.status === 'pending' && !showPending) return false;
    return true;
  });
  
  // Stats
  const successCount = batchResults.filter(r => r.status === 'success').length;
  const failureCount = batchResults.filter(r => r.status === 'failure').length;
  const pendingCount = batchResults.filter(r => r.status === 'pending').length;
  
  // Run selected tests
  const handleRunSelectedTests = async () => {
    if (selectedAchievements.size === 0) {
      toast.error('No achievements selected', {
        description: 'Please select at least one achievement to test'
      });
      return;
    }
    
    setActiveTab('results');
    await runTests(Array.from(selectedAchievements));
  };
  
  // Retry failed tests
  const handleRetryFailed = async () => {
    const failedIds = batchResults
      .filter(r => r.status === 'failure')
      .map(r => r.id);
      
    if (failedIds.length === 0) {
      toast.info('No failed tests to retry');
      return;
    }
    
    setRetryingFailed(true);
    try {
      setActiveTab('results');
      await runTests(failedIds);
    } finally {
      setRetryingFailed(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-arcane-15 border-arcane-30">
        <Dices className="h-4 w-4 text-arcane" />
        <AlertTitle>Batch Testing</AlertTitle>
        <AlertDescription>
          Configure and run tests for multiple achievements at once. Select achievements, run tests, and analyze the results.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="configure" className="flex-1">
            <CheckSquare className="h-4 w-4 mr-2" />
            Configure
          </TabsTrigger>
          <TabsTrigger value="results" className="flex-1">
            <ListRestart className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="configure">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span className="text-lg">Select Achievements to Test</span>
                <div className="text-sm font-normal">
                  {selectedAchievements.size} selected
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllVisible}
                >
                  Select All Visible
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
              
              <Separator />
              
              <ScrollArea className="h-[300px] border border-divider/30 rounded-md p-2">
                <div className="space-y-1">
                  {filteredAchievements.map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-midnight-elevated ${
                        selectedAchievements.has(achievement.id) ? 'bg-arcane-15 border border-arcane-30' : ''
                      }`}
                      onClick={() => toggleAchievementSelection(achievement.id)}
                    >
                      <Checkbox 
                        checked={selectedAchievements.has(achievement.id)}
                        onCheckedChange={() => toggleAchievementSelection(achievement.id)}
                        className="mr-2"
                      />
                      <div>
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-xs text-text-secondary">{achievement.description}</div>
                      </div>
                      <div className="ml-auto flex items-center">
                        <Badge className="mr-2 capitalize">{achievement.category}</Badge>
                        <Badge variant="outline">{achievement.rank}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex justify-between items-center">
                <Button 
                  onClick={handleRunSelectedTests}
                  disabled={selectedAchievements.size === 0 || testProgress.isRunning}
                >
                  {testProgress.isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Run Selected Tests
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-text-secondary">
                  {filteredAchievements.length} achievements in current filter
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span className="text-lg">Test Results</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="success" className="flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    {successCount}
                  </Badge>
                  <Badge variant="destructive" className="flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {failureCount}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {pendingCount}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {testProgress.isRunning && (
                <div className="border border-arcane-30 bg-arcane-15 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Test Progress</div>
                    <div className="text-sm">
                      {testProgress.completed}/{testProgress.total} completed
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="relative h-2">
                      <div className="absolute inset-0 bg-midnight-elevated rounded-full"></div>
                      <div 
                        className="absolute inset-y-0 left-0 bg-arcane rounded-full"
                        style={{ 
                          width: `${testProgress.total > 0 ? (testProgress.completed / testProgress.total) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-text-secondary">
                      <div>
                        <span className="text-success">{testProgress.successful} passed</span>
                        {testProgress.failed > 0 && (
                          <span className="ml-2 text-valor">{testProgress.failed} failed</span>
                        )}
                      </div>
                      <div>
                        {testProgress.currentTest ? (
                          <span>Testing: {testProgress.currentTest}</span>
                        ) : (
                          <span>Running tests...</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopTests}
                    >
                      <PauseCircle className="h-4 w-4 mr-1" />
                      Stop Tests
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="show-successful"
                      checked={showSuccessful}
                      onCheckedChange={() => setShowSuccessful(!showSuccessful)}
                      className="mr-1"
                    />
                    <label 
                      htmlFor="show-successful"
                      className="text-sm text-text-secondary cursor-pointer"
                    >
                      Successful
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox 
                      id="show-failed"
                      checked={showFailed}
                      onCheckedChange={() => setShowFailed(!showFailed)}
                      className="mr-1"
                    />
                    <label 
                      htmlFor="show-failed"
                      className="text-sm text-text-secondary cursor-pointer"
                    >
                      Failed
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox 
                      id="show-pending"
                      checked={showPending}
                      onCheckedChange={() => setShowPending(!showPending)}
                      className="mr-1"
                    />
                    <label 
                      htmlFor="show-pending"
                      className="text-sm text-text-secondary cursor-pointer"
                    >
                      Pending
                    </label>
                  </div>
                </div>
                
                <div className="text-sm text-text-secondary">
                  {filteredResults.length} visible results
                </div>
              </div>
              
              <ScrollArea className="h-[300px] border border-divider/30 rounded-md">
                <div className="space-y-1 p-2">
                  {filteredResults.map(result => (
                    <div 
                      key={result.id}
                      className="border border-divider/30 rounded-md p-2 bg-midnight-card"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="flex items-center mt-1">
                            <Badge className="mr-2 capitalize">{result.category}</Badge>
                            <Badge variant="outline">{result.rank}</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {result.status === 'success' ? (
                            <Badge variant="success" className="flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Pass
                            </Badge>
                          ) : result.status === 'failure' ? (
                            <Badge variant="destructive" className="flex items-center">
                              <X className="h-3 w-3 mr-1" />
                              Fail
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          
                          {result.duration !== undefined && (
                            <div className="ml-2 text-xs text-text-tertiary">
                              {result.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="mt-2 p-2 bg-red-950/30 border border-red-800/50 rounded text-xs text-text-secondary">
                          <div className="flex items-start">
                            <AlertTriangle className="h-3 w-3 text-red-400 mr-1 mt-0.5 flex-shrink-0" />
                            <div>{result.error}</div>
                          </div>
                        </div>
                      )}
                      
                      {result.status === 'failure' && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runTests([result.id])}
                            disabled={testProgress.isRunning}
                          >
                            <Repeat className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleRetryFailed}
                    disabled={testProgress.isRunning || failureCount === 0 || retryingFailed}
                  >
                    {retryingFailed ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Retry Failed
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={clearResults}
                    disabled={testProgress.isRunning || testResults.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Results
                  </Button>
                </div>
                
                <Button
                  onClick={() => setActiveTab('configure')}
                  disabled={testProgress.isRunning}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Edit Test Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestBatchTab;
