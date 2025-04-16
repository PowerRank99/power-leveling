
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ScenarioRunner, ScenarioAction, ScenarioResult, ScenarioProgress, TestScenario } from '@/services/testing/scenarios';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScenarioRunnerComponentProps {
  userId: string;
  scenarioRunner: ScenarioRunner;
  onScenarioComplete?: (result: ScenarioResult) => void;
}

export function ScenarioRunnerComponent({
  userId,
  scenarioRunner,
  onScenarioComplete
}: ScenarioRunnerComponentProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [actions, setActions] = useState<ScenarioAction[]>([]);
  const [progress, setProgress] = useState<ScenarioProgress>({
    isRunning: false,
    isPaused: false,
    totalActions: 0,
    completedActions: 0,
    percentage: 0,
    currentAction: undefined
  });

  useEffect(() => {
    const availableScenarios = scenarioRunner.getAvailableScenarios();
    setScenarios(availableScenarios);
    
    if (availableScenarios.length > 0) {
      setSelectedScenario(availableScenarios[0].id);
    }
  }, [scenarioRunner]);

  const handleRunScenario = async () => {
    if (!selectedScenario || !userId) {
      toast.error('Please select a scenario and ensure user ID is provided');
      return;
    }

    try {
      setIsRunning(true);
      setActions([]);
      setResult(null);
      setProgress({
        isRunning: true,
        isPaused: false,
        totalActions: 0,
        completedActions: 0,
        percentage: 0,
        currentAction: 'Starting scenario...'
      });

      const scenarioResult = await scenarioRunner.runScenario(selectedScenario, userId);
      
      setResult(scenarioResult);
      setActions(scenarioResult.actions || []);
      setProgress({
        isRunning: false,
        isPaused: false,
        totalActions: scenarioResult.actions.length,
        completedActions: scenarioResult.actions.length,
        percentage: 100,
        currentAction: undefined
      });
      
      if (scenarioResult.success) {
        toast.success(`Scenario completed: ${scenarioResult.message || 'Success!'}`);
        
        if (onScenarioComplete) {
          onScenarioComplete(scenarioResult);
        }
      } else {
        toast.error(`Scenario failed: ${scenarioResult.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error running scenario:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setResult({
        success: false,
        error: errorMessage,
        actions: [],
        achievementsUnlocked: [],
        duration: 0
      });
      
      setProgress({
        isRunning: false,
        isPaused: false,
        totalActions: 0,
        completedActions: 0,
        percentage: 0,
        currentAction: undefined
      });
      
      toast.error(`Error running scenario: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePauseScenario = () => {
    // Implementation for pausing the scenario
    setProgress(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-text-secondary';
    }
  };

  const getProgressPercentage = () => {
    if (!progress.totalActions) return 0;
    return Math.round((progress.completedActions / progress.totalActions) * 100);
  };

  const selectedScenarioObj = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-midnight-card border-divider/30">
        <h3 className="text-lg font-medium mb-4">Run Achievement Scenario</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary mb-2">Select Scenario</label>
            <select
              className="w-full p-2 rounded bg-midnight-elevated border border-divider/30"
              value={selectedScenario || ''}
              onChange={(e) => setSelectedScenario(e.target.value)}
              disabled={isRunning}
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>

          {selectedScenarioObj && (
            <div className="text-text-secondary">
              <p>{selectedScenarioObj.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedScenarioObj.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-arcane-15 text-arcane rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button 
              onClick={handleRunScenario} 
              disabled={isRunning || !selectedScenario}
              variant="default"
            >
              Run Scenario
            </Button>
            
            {isRunning && (
              <Button 
                onClick={handlePauseScenario} 
                variant="outline"
              >
                {progress.isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {(isRunning || result) && (
        <Card className="p-4 bg-midnight-card border-divider/30">
          <Tabs defaultValue="progress">
            <TabsList className="mb-4">
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
            </TabsList>

            <TabsContent value="progress">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Status</span>
                    <span className={isRunning ? 'text-green-500' : 'text-text-primary'}>
                      {isRunning ? (progress.isPaused ? 'Paused' : 'Running') : 'Completed'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Actions</span>
                    <span className="text-text-primary">
                      {progress.completedActions} / {progress.totalActions || '?'}
                    </span>
                  </div>
                  
                  {result && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Duration</span>
                      <span className="text-text-primary">{result.duration}ms</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Progress value={progress.percentage} className="h-2" />
                  <div className="text-center text-text-secondary text-sm">
                    {progress.currentAction || 'Waiting to start...'}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions">
              <ScrollArea className="h-60 rounded-md">
                <div className="space-y-2">
                  {actions.length === 0 ? (
                    <div className="text-center text-text-secondary py-4">
                      No actions recorded yet
                    </div>
                  ) : (
                    actions.map((action, index) => (
                      <div 
                        key={index} 
                        className="p-2 border-b border-divider/20 last:border-0"
                      >
                        <div className="flex justify-between">
                          <span className={getActionStatusColor(action.status)}>
                            {action.type}
                          </span>
                          <span className="text-text-tertiary text-xs">
                            {action.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm">{action.description}</p>
                        {action.details && (
                          <pre className="mt-1 text-xs bg-midnight-elevated rounded p-1 overflow-x-auto">
                            {typeof action.details === 'string' 
                              ? action.details 
                              : JSON.stringify(action.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="achievements">
              <ScrollArea className="h-60 rounded-md">
                {result && result.achievementsUnlocked && result.achievementsUnlocked.length > 0 ? (
                  <div className="space-y-2">
                    {result.achievementsUnlocked.map((achievementId, index) => (
                      <div 
                        key={index} 
                        className="p-2 bg-midnight-elevated rounded-md"
                      >
                        <div className="font-medium">{achievementId}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-text-secondary py-4">
                    No achievements unlocked
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="result">
              {result ? (
                <div className="space-y-4">
                  <div 
                    className={`p-3 rounded-md ${
                      result.success ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                    }`}
                  >
                    <div className="font-medium">
                      {result.success ? 'Success' : 'Failed'}
                    </div>
                    <div>
                      {result.message || (result.error && String(result.error))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Duration</span>
                      <span className="text-text-primary">{result.duration}ms</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Actions</span>
                      <span className="text-text-primary">{result.actions.length}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Achievements</span>
                      <span className="text-text-primary">{result.achievementsUnlocked.length}</span>
                    </div>
                  </div>
                  
                  {result.raw && (
                    <div>
                      <div className="text-text-secondary mb-1">Raw Data</div>
                      <pre className="text-xs bg-midnight-elevated rounded p-2 overflow-x-auto">
                        {JSON.stringify(result.raw, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-text-secondary py-4">
                  No result available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
