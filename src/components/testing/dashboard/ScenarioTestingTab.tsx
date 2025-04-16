
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { scenarioRunner } from '@/services/testing/scenarios';

interface ScenarioTestingTabProps {
  userId: string;
}

interface ScenarioResult {
  id: string;
  name: string;
  success: boolean;
  message?: string;
  duration: number;
}

const ScenarioTestingTab: React.FC<ScenarioTestingTabProps> = ({ userId }) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [results, setResults] = useState<Record<string, ScenarioResult>>({});
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  
  useEffect(() => {
    // Get available scenarios
    setScenarios(scenarioRunner.getAvailableScenarios());
  }, []);
  
  const runScenario = async (scenarioId: string) => {
    if (!userId || runningScenario) return;
    
    setRunningScenario(scenarioId);
    
    try {
      const startTime = performance.now();
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found`);
      }
      
      const result = await scenarioRunner.runScenario(userId, scenarioId);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      setResults(prev => ({
        ...prev,
        [scenarioId]: {
          id: scenarioId,
          name: scenario.name,
          success: result.success,
          message: result.message,
          duration
        }
      }));
    } catch (error) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      setResults(prev => ({
        ...prev,
        [scenarioId]: {
          id: scenarioId,
          name: scenario?.name || scenarioId,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: 0
        }
      }));
    } finally {
      setRunningScenario(null);
    }
  };
  
  const runAllScenarios = async () => {
    if (!userId || runningScenario || !scenarios.length) return;
    
    for (const scenario of scenarios) {
      await runScenario(scenario.id);
    }
  };
  
  return (
    <Card className="p-4 bg-midnight-card border-divider/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Testing Scenarios</h2>
        <Button
          variant="arcane"
          onClick={runAllScenarios}
          disabled={!!runningScenario || !scenarios.length}
        >
          <Play className="mr-2 h-4 w-4" />
          Run All Scenarios
        </Button>
      </div>
      
      {scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[200px]">
          <p className="text-text-secondary">No testing scenarios available</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {scenarios.map(scenario => {
              const result = results[scenario.id];
              const isRunning = runningScenario === scenario.id;
              
              return (
                <div 
                  key={scenario.id} 
                  className="p-4 border border-divider/30 rounded-md bg-midnight-elevated"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{scenario.name}</h3>
                      <p className="text-sm text-text-secondary mt-1">{scenario.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runScenario(scenario.id)}
                      disabled={!!runningScenario}
                      className={isRunning ? 'opacity-50' : ''}
                    >
                      {isRunning ? (
                        <div className="animate-spin h-4 w-4 border-2 border-arcane border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Play className="h-3 w-3 mr-2" />
                      )}
                      {isRunning ? 'Running...' : 'Run Scenario'}
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {scenario.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    
                    {scenario.achievementTypes?.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs bg-arcane-15 border-arcane-30">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  
                  {result && (
                    <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-950/20 border border-green-700/30' : 'bg-valor-15 border border-valor-30'}`}>
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-valor mr-2" />
                        )}
                        <span className={`font-medium ${result.success ? 'text-green-500' : 'text-valor'}`}>
                          {result.success ? 'Scenario Passed' : 'Scenario Failed'}
                        </span>
                        <span className="ml-auto text-xs text-text-secondary">
                          {result.duration}ms
                        </span>
                      </div>
                      {result.message && (
                        <p className="text-sm mt-2">
                          {result.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};

export default ScenarioTestingTab;
