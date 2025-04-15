
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Database, AlertCircle } from 'lucide-react';
import AchievementIdRepairTool from './AchievementIdRepairTool';
import AchievementMigrationTool from './AchievementMigrationTool';

interface DataRepairToolsProps {
  userId: string;
}

const DataRepairTools: React.FC<DataRepairToolsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('id-repair');
  
  const handleRepairComplete = () => {
    // Refresh data or update UI as needed
  };
  
  const handleMigrationComplete = () => {
    // Refresh data or update UI as needed
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-arcane-15 border-arcane-30">
        <AlertCircle className="h-4 w-4 text-arcane" />
        <AlertTitle>About Data Repair</AlertTitle>
        <AlertDescription>
          These tools help fix data inconsistencies that can cause achievement tests to fail.
          Run the Achievement ID Repair tool first if you're seeing "No database mapping" errors.
          Use the Database Migration tool to migrate to using the database as the source of truth.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="id-repair" className="flex-1">
            <Wrench className="h-4 w-4 mr-2" />
            Achievement ID Repair
          </TabsTrigger>
          <TabsTrigger value="migration" className="flex-1">
            <Database className="h-4 w-4 mr-2" />
            Database Migration
          </TabsTrigger>
          <TabsTrigger value="data-integrity" className="flex-1">
            <Database className="h-4 w-4 mr-2" />
            Data Integrity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="id-repair">
          <AchievementIdRepairTool 
            userId={userId}
            onRepairComplete={handleRepairComplete}
          />
        </TabsContent>
        
        <TabsContent value="migration">
          <AchievementMigrationTool
            userId={userId}
            onMigrationComplete={handleMigrationComplete}
          />
        </TabsContent>
        
        <TabsContent value="data-integrity">
          <Card>
            <CardHeader>
              <CardTitle>Data Integrity Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tools to fix data integrity issues in achievement records, workout history, and more.
                Coming soon...
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled>
                  <Database className="mr-2 h-4 w-4" />
                  Fix Profile Counters
                </Button>
                <Button variant="outline" disabled>
                  <Database className="mr-2 h-4 w-4" />
                  Fix Achievement Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataRepairTools;
