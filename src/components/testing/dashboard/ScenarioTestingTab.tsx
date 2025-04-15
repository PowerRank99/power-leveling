
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Test Scenarios</AlertTitle>
        <AlertDescription>
          These scenarios simulate real user journeys to test achievement unlocking conditions.
          Each scenario will create test data that can be automatically cleaned up afterward.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Achievement Test Scenarios</CardTitle>
          <CardDescription>
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
