
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { WrenchIcon, BugIcon, DatabaseIcon } from 'lucide-react';
import DataRepairTools from './repair/DataRepairTools';
import TemplateGenerationSystem from './templates/TemplateGenerationSystem';

interface TestRepairTabProps {
  userId: string;
}

const TestRepairTab: React.FC<TestRepairTabProps> = ({ userId }) => {
  const [logEntries, setLogEntries] = useState<Array<{ timestamp: Date; action: string; details: string }>>([]);
  
  const addLogEntry = (action: string, details: string) => {
    setLogEntries(prev => [
      { timestamp: new Date(), action, details },
      ...prev
    ]);
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-valor-15 border-valor-30">
        <WrenchIcon className="h-4 w-4 text-valor" />
        <AlertTitle>Data Repair & Generation Tools</AlertTitle>
        <AlertDescription>
          Tools for inspecting, fixing, and generating test data to ensure achievement tests work correctly.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="repair">
        <TabsList>
          <TabsTrigger value="repair">Data Repair</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="inspection">Data Inspection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="repair" className="pt-4">
          <DataRepairTools userId={userId} addLogEntry={addLogEntry} />
        </TabsContent>
        
        <TabsContent value="templates" className="pt-4">
          <TemplateGenerationSystem />
        </TabsContent>
        
        <TabsContent value="inspection" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DatabaseIcon className="h-4 w-4 mr-2 text-arcane" />
                Database Inspection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
                <BugIcon className="h-16 w-16 mb-4 text-text-tertiary" />
                <h3 className="text-lg font-medium">Data Inspection Tools</h3>
                <p className="text-center max-w-md mt-2">
                  Deep inspection of achievement state, progress tracking, and data relationships between different parts of the system.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Log panel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            Action Log
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[200px] overflow-y-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-midnight-elevated">
              <tr>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logEntries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-text-tertiary">
                    No actions logged yet
                  </td>
                </tr>
              ) : (
                logEntries.map((entry, index) => (
                  <tr key={index} className="border-t border-divider/30">
                    <td className="p-2 text-text-tertiary">
                      {entry.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="p-2 font-medium">{entry.action}</td>
                    <td className="p-2 text-text-secondary">{entry.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRepairTab;
