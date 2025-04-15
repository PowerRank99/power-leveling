import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  StopCircle, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  RotateCw,
  Settings,
  ChevronDown,
  ChevronUp,
  Timer,
  AlertTriangle,
  Trash2,
  BarChart,
  Info
} from 'lucide-react';

import { 
  scenarioRunner, 
  ScenarioOptions, 
  ScenarioProgress, 
  ScenarioResult,
  ScenarioAction,
  TestScenario
} from '@/services/testing/scenarios';
import { useAuth } from '@/hooks/useAuth';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

interface ScenarioRunnerProps {
  userId?: string;
}

interface ExecutionTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const ScenarioRunnerComponent: React.FC<ScenarioRunnerProps> = ({ userId }) => {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarioOptions, setScenarioOptions] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState<ScenarioProgress>({
    percentage: 0,
    totalActions: 0,
    completedActions: 0,
    isRunning: false,
    isPaused: false
  });
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('execution');
  const [executionLog, setExecutionLog] = useState<ScenarioAction[]>([]);
  const [activeOptions, setActiveOptions] = useState<ScenarioOptions>({
    speed: 0.5,
    silent: false,
    autoCleanup: true
  });

  const targetUserId = userId || user?.id || '';

  const scenarios = scenarioRunner.getScenarios();

  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenario) {
      setSelectedScenario(scenarios[0].id);
      loadScenarioOptions(scenarios[0].id);
    }
  }, [scenarios, selectedScenario]);

  useEffect(() => {
    scenarioRunner.setProgressCallback(handleProgressUpdate);
    return () => {
      scenarioRunner.setProgressCallback(() => {});
    };
  }, []);

  const loadScenarioOptions = (scenarioId: string) => {
    const scenario = scenarioRunner.getScenario(scenarioId);
    if (scenario) {
      const options = scenario.getConfigurationOptions();
      setScenarioOptions(options);
      
      const initialOptions: Record<string, any> = {};
      Object.entries(options).forEach(([key, config]) => {
        initialOptions[key] = config.default;
      });
      
      setActiveOptions(prev => ({
        ...prev,
        ...initialOptions
      }));
    }
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setResult(null);
    setExecutionLog([]);
    setProgress({
      percentage: 0,
      totalActions: 0,
      completedActions: 0,
      isRunning: false,
      isPaused: false
    });
    loadScenarioOptions(scenarioId);
  };

  const handleOptionChange = (key: string, value: any) => {
    setActiveOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProgressUpdate = (newProgress: ScenarioProgress) => {
    setProgress(newProgress);
    
    if (newProgress.currentAction && newProgress.completedActions > executionLog.length) {
      setExecutionLog(prev => [
        ...prev,
        { 
          type: 'PROGRESS_UPDATE', 
          description: newProgress.currentAction || 'Running scenario', 
          timestamp: new Date(),
          success: true
        }
      ]);
    }
  };

  const runScenario = async () => {
    if (!selectedScenario || !targetUserId) {
      toast.error('Cannot run scenario', {
        description: !selectedScenario ? 'No scenario selected' : 'No user ID provided'
      });
      return;
    }

    try {
      setResult(null);
      setExecutionLog([]);
      setProgress({
        percentage: 0,
        totalActions: 0,
        completedActions: 0,
        isRunning: true,
        isPaused: false
      });
      
      const result = await scenarioRunner.runScenario(
        selectedScenario,
        targetUserId,
        activeOptions
      );
      
      setResult(result);
      if (result.actions) {
        setExecutionLog(result.actions);
      }
      
      setProgress(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
        percentage: 100
      }));
      
      if (result.success) {
        toast.success('Scenario completed successfully', {
          description: `Unlocked ${result.achievementsUnlocked.length} achievements`
        });
      } else {
        toast.error('Scenario failed', {
          description: result.error || 'Unknown error'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error running scenario', {
        description: errorMessage
      });
      
      setProgress(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false
      }));
    }
  };

  const pauseExecution = () => {
    if (progress.isRunning && !progress.isPaused) {
      scenarioRunner.pauseCurrentScenario();
    }
  };

  const resumeExecution = () => {
    if (progress.isRunning && progress.isPaused) {
      scenarioRunner.resumeCurrentScenario();
    }
  };

  const stopExecution = () => {
    toast.info('Stopping scenario execution is not yet implemented', {
      description: 'Please wait for the scenario to complete'
    });
  };

  const downloadResults = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `scenario-result-${selectedScenario}-${new Date().toISOString()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const cleanupTestData = async () => {
    if (!selectedScenario || !targetUserId) return;
    
    const scenario = scenarioRunner.getScenario(selectedScenario);
    if (!scenario) return;
    
    try {
      toast.info('Cleaning up test data', {
        description: 'This may take a moment'
      });
      
      const success = await scenario.cleanup(targetUserId, { silent: false });
      
      if (success) {
        toast.success('Test data cleaned up successfully');
      } else {
        toast.error('Failed to clean up all test data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error cleaning up test data', {
        description: errorMessage
      });
    }
  };

  const currentScenario = selectedScenario ? scenarioRunner.getScenario(selectedScenario) : null;

  const ConfigPanel = (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Configuration</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            {isConfigOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Configure the scenario parameters
        </CardDescription>
      </CardHeader>
      
      {isConfigOpen && (
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-select">Scenario</Label>
              <Select
                value={selectedScenario || ''}
                onValueChange={handleScenarioChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {currentScenario && (
                <p className="text-sm text-text-secondary mt-1">
                  {currentScenario.description}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Global Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="speed-slider">Execution Speed</Label>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-text-secondary" />
                    <Slider
                      id="speed-slider"
                      max={1}
                      min={0}
                      step={0.1}
                      value={[activeOptions.speed || 0.5]}
                      onValueChange={([value]) => handleOptionChange('speed', value)}
                      className="flex-1"
                    />
                    <RotateCw className="h-4 w-4 text-text-secondary" />
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {activeOptions.speed < 0.3 ? 'Slow (realistic timing)' :
                     activeOptions.speed < 0.7 ? 'Medium' : 'Fast (minimal delays)'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-cleanup"
                      checked={activeOptions.autoCleanup}
                      onCheckedChange={(checked) => handleOptionChange('autoCleanup', checked)}
                    />
                    <Label htmlFor="auto-cleanup">Auto Cleanup</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="silent-mode"
                      checked={activeOptions.silent}
                      onCheckedChange={(checked) => handleOptionChange('silent', checked)}
                    />
                    <Label htmlFor="silent-mode">Silent Mode</Label>
                  </div>
                </div>
              </div>
            </div>
            
            {currentScenario && Object.keys(scenarioOptions).length > 0 && (
              <div className="space-y-2">
                <Separator />
                <h3 className="text-sm font-medium">Scenario Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(scenarioOptions).map(([key, config]) => {
                    if (['speed', 'silent', 'autoCleanup'].includes(key)) {
                      return null;
                    }
                    
                    switch (config.type) {
                      case 'number':
                        return (
                          <div key={key} className="space-y-1">
                            <Label htmlFor={`option-${key}`}>{config.label}</Label>
                            <Input
                              id={`option-${key}`}
                              type="number"
                              min={config.min}
                              max={config.max}
                              value={activeOptions[key] || config.default}
                              onChange={(e) => handleOptionChange(key, Number(e.target.value))}
                            />
                            {config.description && (
                              <p className="text-xs text-text-tertiary">{config.description}</p>
                            )}
                          </div>
                        );
                        
                      case 'boolean':
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`option-${key}`}
                                checked={activeOptions[key] || config.default}
                                onCheckedChange={(checked) => handleOptionChange(key, checked)}
                              />
                              <Label htmlFor={`option-${key}`}>{config.label}</Label>
                            </div>
                            {config.description && (
                              <p className="text-xs text-text-tertiary">{config.description}</p>
                            )}
                          </div>
                        );
                        
                      case 'select':
                        return (
                          <div key={key} className="space-y-1">
                            <Label htmlFor={`option-${key}`}>{config.label}</Label>
                            <Select
                              value={String(activeOptions[key] || config.default)}
                              onValueChange={(value) => handleOptionChange(key, value)}
                            >
                              <SelectTrigger id={`option-${key}`}>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                {config.options.map((option: any) => {
                                  const value = typeof option === 'object' ? option.value : option;
                                  const label = typeof option === 'object' ? option.label : option;
                                  return (
                                    <SelectItem key={value} value={String(value)}>
                                      {label}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            {config.description && (
                              <p className="text-xs text-text-tertiary">{config.description}</p>
                            )}
                          </div>
                        );
                        
                      case 'string':
                        return (
                          <div key={key} className="space-y-1">
                            <Label htmlFor={`option-${key}`}>{config.label}</Label>
                            <Input
                              id={`option-${key}`}
                              value={activeOptions[key] || config.default}
                              onChange={(e) => handleOptionChange(key, e.target.value)}
                            />
                            {config.description && (
                              <p className="text-xs text-text-tertiary">{config.description}</p>
                            )}
                          </div>
                        );
                        
                      case 'multiselect':
                        return (
                          <div key={key} className="space-y-1">
                            <Label htmlFor={`option-${key}`}>{config.label}</Label>
                            <p className="text-xs text-text-tertiary">
                              Multi-select not implemented yet. Using defaults.
                            </p>
                          </div>
                        );
                        
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  const ProgressIndicator = (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Progress</h3>
          {progress.isRunning && (
            <Badge variant={progress.isPaused ? "outline" : "default"}>
              {progress.isPaused ? 'Paused' : 'Running'}
            </Badge>
          )}
        </div>
        <div className="text-sm text-text-secondary">
          {progress.completedActions} / {progress.totalActions > 0 ? progress.totalActions : '?'} actions
        </div>
      </div>
      
      <div className="h-2 w-full bg-midnight-card rounded-full overflow-hidden">
        <div 
          className="h-full bg-arcane-gradient rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      
      {progress.currentAction && (
        <p className="text-sm text-text-secondary italic">
          {progress.currentAction}
        </p>
      )}
      
      <div className="flex items-center space-x-2">
        {progress.isRunning ? (
          <>
            {progress.isPaused ? (
              <Button size="sm" variant="outline" onClick={resumeExecution}>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={pauseExecution}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={stopExecution}>
              <StopCircle className="h-4 w-4 mr-1" />
              Stop
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="arcane" onClick={runScenario} disabled={!currentScenario || !targetUserId}>
              <Play className="h-4 w-4 mr-1" />
              Run Scenario
            </Button>
            
            {result && (
              <>
                <Button size="sm" variant="outline" onClick={downloadResults}>
                  <Download className="h-4 w-4 mr-1" />
                  Download Results
                </Button>
                
                <Button size="sm" variant="outline" onClick={cleanupTestData}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clean Up Data
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  const ExecutionLog = (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Execution Log</CardTitle>
        <CardDescription>
          Real-time log of scenario actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {executionLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-text-tertiary">
              <Info className="h-8 w-8 mb-2 opacity-50" />
              <p>Run a scenario to see the execution log</p>
            </div>
          ) : (
            <div className="space-y-2">
              {executionLog.map((action, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-md text-sm border ${
                    action.success ? 'border-divider/30 bg-midnight-card/50' : 
                    'border-valor-30 bg-valor-15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {action.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-medium">{action.type}</span>
                    </div>
                    <div className="text-xs text-text-tertiary whitespace-nowrap">
                      {action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : ''}
                    </div>
                  </div>
                  <p className="mt-1 text-text-secondary">
                    {action.description}
                  </p>
                  {action.error && (
                    <p className="mt-1 text-red-500 text-xs">
                      {action.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const ResultsSummary = (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Results Summary</CardTitle>
        <CardDescription>
          Summary of scenario execution results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-text-tertiary">
            <BarChart className="h-8 w-8 mb-2 opacity-50" />
            <p>Run a scenario to see results</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {result.success ? (
                <Badge className="bg-green-600">Success</Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
              <span className="text-sm">
                Execution time: {(result.executionTimeMs / 1000).toFixed(2)}s
              </span>
            </div>
            
            {result.error && (
              <div className="p-2 rounded-md border border-red-400 bg-red-400/10 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>{result.error}</span>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium mb-2">Achievements Unlocked: {result.achievementsUnlocked.length}</h3>
              
              {result.achievementsUnlocked.length === 0 ? (
                <p className="text-sm text-text-tertiary">No achievements were unlocked</p>
              ) : (
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-1">
                    {result.achievementsUnlocked.map((id, index) => {
                      const achievement = AchievementUtils.getAchievementById(id);
                      return (
                        <div key={index} className="flex items-center space-x-2 p-1 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{achievement?.name || id}</span>
                          {achievement?.rank && (
                            <Badge variant="outline" className="ml-auto">
                              Rank {achievement.rank}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            {result.completionPercentage !== undefined && (
              <div>
                <h3 className="text-sm font-medium mb-2">Completion Rate</h3>
                <div className="h-2 w-full bg-midnight-card rounded-full overflow-hidden mb-1">
                  <div 
                    className="h-full bg-arcane-gradient rounded-full"
                    style={{ width: `${result.completionPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-text-secondary">
                  {result.unlockedCount} of {result.targetCount} achievements ({result.completionPercentage.toFixed(1)}%)
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const resultTabs: ExecutionTab[] = [
    {
      id: 'execution',
      name: 'Execution Log',
      icon: <Clock className="h-4 w-4" />,
      component: ExecutionLog
    },
    {
      id: 'results',
      name: 'Results',
      icon: <BarChart className="h-4 w-4" />,
      component: ResultsSummary
    }
  ];

  return (
    <div className="space-y-4">
      {ConfigPanel}
      
      {ProgressIndicator}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-midnight-card/80 border border-divider/30">
          {resultTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
              {tab.icon}
              <span className="ml-1">{tab.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {resultTabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScenarioRunnerComponent;
