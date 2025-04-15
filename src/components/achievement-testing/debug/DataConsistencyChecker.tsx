
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Check, AlertTriangle, RefreshCcw, ShieldAlert, Wrench, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface DataConsistencyCheckerProps {
  userId: string;
}

interface ConsistencyIssue {
  id: string;
  type: 'error' | 'warning';
  description: string;
  details: string;
  fixable: boolean;
}

const DataConsistencyChecker: React.FC<DataConsistencyCheckerProps> = ({ userId }) => {
  const { logAction } = useTestingDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Check for consistency issues
  const checkConsistency = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would perform actual consistency checks
      // For this example, we'll use simulated data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated issues - this would be real in production
      const simulatedIssues: ConsistencyIssue[] = [
        {
          id: '1',
          type: 'error',
          description: 'Missing achievement progress records',
          details: 'Found 3 achievements with unlocked status but no corresponding progress records',
          fixable: true
        },
        {
          id: '2',
          type: 'warning',
          description: 'Inconsistent workout count',
          details: 'Profile workouts_count (12) does not match actual workouts in database (14)',
          fixable: true
        },
        {
          id: '3',
          type: 'error',
          description: 'Orphaned workout sets',
          details: 'Found 8 workout sets without a corresponding workout record',
          fixable: true
        },
        {
          id: '4',
          type: 'warning',
          description: 'Stale streak data',
          details: 'User streak may be incorrect based on workout history',
          fixable: true
        }
      ];
      
      setIssues(simulatedIssues);
      setLastChecked(new Date());
      
      logAction('Consistency Check', `Found ${simulatedIssues.length} issues`);
      
      toast.success('Consistency check completed', {
        description: `Found ${simulatedIssues.length} issues`
      });
    } catch (error) {
      toast.error('Error checking data consistency', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fix consistency issues
  const fixIssues = async () => {
    if (issues.length === 0) return;
    
    setIsFixing(true);
    try {
      // In a real implementation, this would perform actual fixes
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear issues - in a real implementation, we'd run the check again
      setIssues([]);
      
      logAction('Data Repair', 'Fixed consistency issues');
      
      toast.success('Issues fixed successfully', {
        description: 'All data consistency issues have been resolved'
      });
    } catch (error) {
      toast.error('Error fixing issues', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <ShieldAlert className="mr-2 h-5 w-5 text-arcane" />
          Data Consistency Checker
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <Button
              onClick={checkConsistency}
              disabled={isLoading}
              className="mr-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              Run Consistency Check
            </Button>
            
            {issues.length > 0 && (
              <Button
                onClick={fixIssues}
                disabled={isFixing || issues.length === 0}
                variant="outline"
              >
                {isFixing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wrench className="h-4 w-4 mr-2" />
                )}
                Fix All Issues
              </Button>
            )}
          </div>
          
          {lastChecked && (
            <div className="text-sm text-text-secondary">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        {issues.length > 0 && (
          <div className="flex items-center space-x-2 mb-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
              </Badge>
            )}
            
            {warningCount > 0 && (
              <Badge variant="outline" className="bg-yellow-950/50 text-yellow-400 border-yellow-800/50 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
              </Badge>
            )}
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full bg-midnight-elevated" />
            ))}
          </div>
        ) : issues.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {issues.map(issue => (
                <div 
                  key={issue.id}
                  className={`border rounded-md p-3 ${
                    issue.type === 'error' 
                      ? 'border-red-800/50 bg-red-950/30' 
                      : 'border-yellow-800/50 bg-yellow-950/30'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      {issue.type === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                      )}
                      <span className="font-medium">{issue.description}</span>
                    </div>
                    
                    {issue.fixable && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={issue.type === 'error' ? 'border-red-700/70' : 'border-yellow-700/70'}
                        onClick={() => {
                          setIssues(issues.filter(i => i.id !== issue.id));
                          toast.success(`Fixed: ${issue.description}`);
                        }}
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        Fix
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm mt-1 ml-6 text-text-secondary">
                    {issue.details}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : lastChecked ? (
          <Alert className="bg-success/10 border-success/30">
            <Check className="h-4 w-4 text-success" />
            <AlertTitle>No Issues Found</AlertTitle>
            <AlertDescription>
              All user achievement data is consistent. No repair actions needed.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <ShieldAlert className="h-12 w-12 text-text-tertiary mb-4" />
            <p className="text-text-secondary">No consistency check run yet</p>
            <p className="text-xs text-text-tertiary mt-1">Click "Run Consistency Check" to scan for data issues</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataConsistencyChecker;
