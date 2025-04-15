
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Hammer } from 'lucide-react';
import DataRepairTools from './repair/DataRepairTools';

interface TestRepairTabProps {
  userId: string;
}

const TestRepairTab: React.FC<TestRepairTabProps> = ({ userId }) => {
  const addLogEntry = (action: string, details: string) => {
    console.log(`[LOG] ${action}: ${details}`);
    // This would be handled by the parent component in a real implementation
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-arcane-15 border-arcane-30">
        <Hammer className="h-4 w-4 text-arcane" />
        <AlertTitle>Data Repair Tools</AlertTitle>
        <AlertDescription>
          Identify and fix data inconsistencies that may prevent achievements from unlocking correctly.
          Use these tools to repair broken progress tracking and achievement states.
        </AlertDescription>
      </Alert>
      
      <DataRepairTools userId={userId} addLogEntry={addLogEntry} />
    </div>
  );
};

export default TestRepairTab;
