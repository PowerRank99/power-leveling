
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wrench, RefreshCw, Database, Award, Undo2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TestRepairTabProps {
  userId: string;
}

const TestRepairTab: React.FC<TestRepairTabProps> = ({ userId }) => {
  const handleRepairAction = (actionName: string, description: string) => {
    toast.info(`Simulating repair: ${actionName}`, {
      description: description
    });
  };
  
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Advanced Tools</AlertTitle>
        <AlertDescription>
          These repair tools modify achievement data directly. Only use these when standard testing methods fail.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron flex items-center">
              <Wrench className="mr-2 h-5 w-5 text-valor" />
              Achievement Repair Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2 text-arcane" />
                  <span>Reset Achievement Progress</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRepairAction(
                    "Reset Achievement Progress",
                    "Cleared all progress tracking without removing unlocked achievements"
                  )}
                >
                  Reset
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Clear progress tracking without removing unlocked achievements
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-valor" />
                  <span>Fix Orphaned Achievements</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRepairAction(
                    "Fix Orphaned Achievements",
                    "Identified and fixed 0 orphaned achievement records"
                  )}
                >
                  Scan & Fix
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Find and repair achievement records with missing progress data
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Re-validate All Achievements</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRepairAction(
                    "Re-validate All Achievements",
                    "Started re-validating all achievements for this user"
                  )}
                >
                  Validate
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Recheck all achievement conditions for current user state
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Undo2 className="h-4 w-4 mr-2 text-red-500" />
                  <span>Remove All Achievements</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRepairAction(
                    "Remove All Achievements",
                    "Removed all achievements for this user. This action cannot be undone."
                  )}
                >
                  Remove All
                </Button>
              </div>
              <p className="text-xs text-text-secondary text-red-500">
                WARNING: Permanently removes all achievements for this user
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron flex items-center">
              <Database className="mr-2 h-5 w-5 text-arcane" />
              Data Consistency Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleRepairAction(
                "Run Data Consistency Check",
                "Started checking for data inconsistencies"
              )}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Consistency Check
            </Button>
            
            <div className="border border-divider/30 rounded-md p-3">
              <h3 className="font-semibold mb-2">Last Check Results</h3>
              <p className="text-sm text-text-tertiary">
                No consistency check has been run yet.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Common Issues:</h3>
              
              <div className="text-sm space-y-1">
                <div className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-2" />
                  <span>Missing achievement progress records</span>
                </div>
                
                <div className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-2" />
                  <span>Orphaned achievements with no user data</span>
                </div>
                
                <div className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-2" />
                  <span>Inconsistent achievement unlocks</span>
                </div>
                
                <div className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-2" />
                  <span>Duplicate achievement records</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-orbitron">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-divider/30 rounded-md p-3">
              <h3 className="text-sm font-semibold mb-1">Achievement Records</h3>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">0</span>
                <span className="text-sm text-text-tertiary">for this user</span>
              </div>
            </div>
            
            <div className="border border-divider/30 rounded-md p-3">
              <h3 className="text-sm font-semibold mb-1">Progress Records</h3>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">0</span>
                <span className="text-sm text-text-tertiary">tracking entries</span>
              </div>
            </div>
            
            <div className="border border-divider/30 rounded-md p-3">
              <h3 className="text-sm font-semibold mb-1">System Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  <span>Healthy</span>
                </div>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRepairTab;
