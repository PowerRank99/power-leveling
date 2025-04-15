
import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StickyNote, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataRepairTools from './repair/DataRepairTools';

interface TestRepairTabProps {
  userId: string;
}

const TestRepairTab: React.FC<TestRepairTabProps> = ({ userId }) => {
  return (
    <div className="space-y-4">
      <Alert className="bg-valor-15 border-valor-30">
        <Wrench className="h-4 w-4 text-valor" />
        <AlertTitle>Data Repair Tools</AlertTitle>
        <AlertDescription>
          Identify and fix issues in achievement data, such as missing progress records, inconsistent counts, and orphaned data.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="repair-tools">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="repair-tools" className="flex-1">
            <Wrench className="h-4 w-4 mr-2" />
            Repair Tools
          </TabsTrigger>
          <TabsTrigger value="repair-guide" className="flex-1">
            <StickyNote className="h-4 w-4 mr-2" />
            Repair Guide
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="repair-tools">
          <DataRepairTools userId={userId} />
        </TabsContent>
        
        <TabsContent value="repair-guide">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Achievement Data Repair Guide</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">When to use repair tools?</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Use the repair tools when you notice achievements aren't triggering correctly,
                  or when you've made significant changes to the test data that might have left
                  inconsistencies in the database.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Common issues that may require repair:</h4>
                <ul className="space-y-1 text-sm text-text-secondary ml-5 list-disc mt-1">
                  <li>
                    <span className="font-medium">Missing progress records:</span>
                    {' '}Achievement is earned but no progress record exists
                  </li>
                  <li>
                    <span className="font-medium">Incorrect counters:</span>
                    {' '}The profile's workout count doesn't match actual workouts
                  </li>
                  <li>
                    <span className="font-medium">Orphaned records:</span>
                    {' '}Workout sets without a parent workout record
                  </li>
                  <li>
                    <span className="font-medium">Stale streak data:</span>
                    {' '}User streak hasn't been properly updated
                  </li>
                  <li>
                    <span className="font-medium">Missing personal records:</span>
                    {' '}PRs that should have been created but weren't
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">How repair works:</h4>
                <ol className="space-y-1 text-sm text-text-secondary ml-5 list-decimal mt-1">
                  <li>Scan analyzes user data for potential inconsistencies</li>
                  <li>Issues are categorized by severity (critical, warning, info)</li>
                  <li>Select specific issues or repair all at once</li>
                  <li>Repair operations run database queries to fix the issues</li>
                  <li>Re-scan after repair to verify fixes</li>
                </ol>
              </div>
              
              <div className="p-3 border border-arcane-30 bg-arcane-15 rounded-md mt-2">
                <p className="text-sm">
                  <span className="font-medium">Pro tip:</span>
                  {' '}Run a full scan after making major changes to test data or when
                  developing new achievement types to ensure data consistency.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestRepairTab;
