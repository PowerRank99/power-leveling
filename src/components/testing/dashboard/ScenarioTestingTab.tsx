
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ScenarioRunnerComponent from '@/components/testing/scenarios/ScenarioRunnerComponent';
import { scenarioRunner } from '@/services/testing/scenarios';

interface ScenarioTestingTabProps {
  userId: string;
}

const ScenarioTestingTab: React.FC<ScenarioTestingTabProps> = ({ userId }) => {
  const scenarios = scenarioRunner.getScenarios();
  
  return (
    <div className="space-y-4">
      <Alert className="mb-4 bg-midnight-elevated border-arcane-30">
        <AlertCircle className="h-4 w-4 text-arcane" />
        <AlertTitle className="text-text-primary">Test Scenarios</AlertTitle>
        <AlertDescription className="text-text-secondary">
          These scenarios simulate real user journeys to test achievement unlocking conditions.
          Each scenario will create test data that can be automatically cleaned up afterward.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-midnight-card border-divider/30">
        <CardHeader>
          <CardTitle className="text-text-primary">Achievement Test Scenarios</CardTitle>
          <CardDescription className="text-text-secondary">
            Run pre-configured scenarios to test achievements across different user journeys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScenarioRunnerComponent userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioTestingTab;
