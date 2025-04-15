
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bug, Terminal, Database, Wrench, AlertTriangle, PieChart, Search } from 'lucide-react';
import DataInspector from './DataInspector';
import AchievementProgressVisualizer from './AchievementProgressVisualizer';
import DataConsistencyChecker from './DataConsistencyChecker';
import LoggingPanel from '../LoggingPanel';

interface TestDebugTabProps {
  userId: string;
  logEntries: Array<{ timestamp: Date; action: string; details: string }>;
  onClearLogs: () => void;
}

const TestDebugTab: React.FC<TestDebugTabProps> = ({ 
  userId,
  logEntries,
  onClearLogs
}) => {
  const { isLoading } = useTestingDashboard();
  const [activeTab, setActiveTab] = useState('inspect');
  
  return (
    <div className="space-y-4">
      <Alert className="bg-valor-15 border-valor-30">
        <Bug className="h-4 w-4 text-valor" />
        <AlertTitle>Testing Debug Tools</AlertTitle>
        <AlertDescription>
          Inspect and manipulate test data, check data consistency, 
          visualize achievement progress, and identify potential issues.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="inspect" className="flex-1">
            <Database className="h-4 w-4 mr-2" />
            Data Inspector
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex-1">
            <PieChart className="h-4 w-4 mr-2" />
            Progress Visualizer
          </TabsTrigger>
          <TabsTrigger value="consistency" className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Consistency Check
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex-1">
            <Terminal className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inspect">
          <DataInspector userId={userId} />
        </TabsContent>
        
        <TabsContent value="progress">
          <AchievementProgressVisualizer userId={userId} />
        </TabsContent>
        
        <TabsContent value="consistency">
          <DataConsistencyChecker userId={userId} />
        </TabsContent>
        
        <TabsContent value="logs">
          <LoggingPanel logEntries={logEntries} clearLogs={onClearLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestDebugTab;
