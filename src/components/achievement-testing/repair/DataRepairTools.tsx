
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Wrench, AlertTriangle, Check, Loader2, RefreshCcw, Trash2, Cog } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataRepairToolsProps {
  userId: string;
}

interface RepairIssue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  repairAction: string;
}

const DataRepairTools: React.FC<DataRepairToolsProps> = ({ userId }) => {
  const { logAction } = useTestingDashboard();
  const [isScanning, setIsScanning] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [issues, setIssues] = useState<RepairIssue[]>([]);
  const [activeTab, setActiveTab] = useState('scan');
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  
  // Scan for issues
  const scanForIssues = async () => {
    if (!userId) return;
    
    setIsScanning(true);
    try {
      // In a real implementation, this would actually scan the database
      // For this example, we'll use simulated issues
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated issues
      const simulatedIssues: RepairIssue[] = [
        {
          id: '1',
          type: 'critical',
          title: 'Missing achievement progress records',
          description: 'User has earned achievements but some progress records are missing, which may prevent future unlocks.',
          repairAction: 'Regenerate missing achievement_progress records based on user activity'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Inconsistent workout counts',
          description: 'The user\'s workout count in profile (14) does not match the actual count in the workouts table (16).',
          repairAction: 'Update profile.workouts_count to match the actual count in workouts table'
        },
        {
          id: '3',
          type: 'critical',
          title: 'Orphaned workout sets',
          description: '8 workout sets exist without a parent workout record, which may cause achievement checks to miss workouts.',
          repairAction: 'Delete orphaned workout_sets records'
        },
        {
          id: '4',
          type: 'info',
          title: 'Potentially stale personal records',
          description: 'Some recent workouts have higher weights than recorded PRs, but no PR records were created.',
          repairAction: 'Scan workouts and create missing PR records'
        }
      ];
      
      setIssues(simulatedIssues);
      
      logAction('Data Repair Scan', `Found ${simulatedIssues.length} issues to repair`);
      
      toast.success('Scan completed', {
        description: `Found ${simulatedIssues.length} issues that can be repaired`
      });
      
      setActiveTab('repair');
    } catch (error) {
      toast.error('Error scanning for data issues', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  // Repair selected issues
  const repairSelectedIssues = async () => {
    if (selectedIssues.size === 0) {
      toast.error('No issues selected', {
        description: 'Please select at least one issue to repair'
      });
      return;
    }
    
    setIsRepairing(true);
    try {
      // In a real implementation, this would perform actual repairs
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Remove fixed issues
      const remainingIssues = issues.filter(
        issue => !selectedIssues.has(issue.id)
      );
      setIssues(remainingIssues);
      setSelectedIssues(new Set());
      
      logAction('Data Repair', `Repaired ${selectedIssues.size} data issues`);
      
      toast.success('Repair completed', {
        description: `Successfully repaired ${selectedIssues.size} data issues`
      });
    } catch (error) {
      toast.error('Error repairing data issues', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  // Toggle issue selection
  const toggleIssueSelection = (issueId: string) => {
    const newSelection = new Set(selectedIssues);
    if (newSelection.has(issueId)) {
      newSelection.delete(issueId);
    } else {
      newSelection.add(issueId);
    }
    setSelectedIssues(newSelection);
  };
  
  // Select/deselect all issues
  const toggleAllIssues = () => {
    if (selectedIssues.size === issues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(issues.map(issue => issue.id)));
    }
  };
  
  // Repair all issues
  const repairAllIssues = async () => {
    if (issues.length === 0) return;
    
    setIsRepairing(true);
    try {
      // In a real implementation, this would perform actual repairs
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clear all issues
      setIssues([]);
      setSelectedIssues(new Set());
      
      logAction('Data Repair', `Repaired all ${issues.length} data issues`);
      
      toast.success('Repair completed', {
        description: `Successfully repaired all ${issues.length} data issues`
      });
    } catch (error) {
      toast.error('Error repairing data issues', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  // Count issues by type
  const criticalCount = issues.filter(i => i.type === 'critical').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Wrench className="mr-2 h-5 w-5 text-arcane" />
          Data Repair Tools
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="scan" className="flex-1">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Scan for Issues
            </TabsTrigger>
            <TabsTrigger value="repair" className="flex-1">
              <Wrench className="h-4 w-4 mr-2" />
              Repair Issues{issues.length > 0 ? ` (${issues.length})` : ''}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan">
            <div className="space-y-4">
              <Alert className="bg-arcane-15 border-arcane-30">
                <Cog className="h-4 w-4 text-arcane" />
                <AlertTitle>Database Repair Tools</AlertTitle>
                <AlertDescription>
                  Scan your user data for inconsistencies that might prevent achievements from unlocking properly.
                  This will check for orphaned records, missing progress data, and more.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="font-medium">What This Will Check</div>
                <ul className="space-y-1 text-sm text-text-secondary ml-5 list-disc">
                  <li>Missing progress records for achievements</li>
                  <li>Incorrect counters in user profile</li>
                  <li>Orphaned workout sets without parent workouts</li>
                  <li>Missing personal records that should have been created</li>
                  <li>Incorrect streak calculations</li>
                  <li>Achievement progress that should be marked complete</li>
                </ul>
              </div>
              
              <div className="flex justify-between">
                <Button
                  onClick={scanForIssues}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Scan for Issues
                    </>
                  )}
                </Button>
                
                {issues.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('repair')}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    View Issues ({issues.length})
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="repair">
            {issues.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {criticalCount > 0 && (
                    <Badge variant="destructive" className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {criticalCount} {criticalCount === 1 ? 'Critical' : 'Critical'}
                    </Badge>
                  )}
                  
                  {warningCount > 0 && (
                    <Badge variant="outline" className="bg-yellow-950/50 text-yellow-400 border-yellow-800/50 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
                    </Badge>
                  )}
                  
                  {infoCount > 0 && (
                    <Badge variant="outline" className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {infoCount} Info
                    </Badge>
                  )}
                  
                  <div className="text-sm text-text-secondary ml-auto">
                    {selectedIssues.size} of {issues.length} selected
                  </div>
                </div>
                
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-4">
                    {issues.map(issue => (
                      <div 
                        key={issue.id}
                        className={`border rounded-md p-3 cursor-pointer ${
                          selectedIssues.has(issue.id) 
                            ? 'border-arcane-30 bg-arcane-15'
                            : issue.type === 'critical'
                              ? 'border-red-800/50 bg-red-950/30'
                              : issue.type === 'warning'
                                ? 'border-yellow-800/50 bg-yellow-950/30'
                                : 'border-divider/30 bg-midnight-elevated/50'
                        }`}
                        onClick={() => toggleIssueSelection(issue.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="mt-0.5 mr-2">
                              {selectedIssues.has(issue.id) ? (
                                <div className="h-4 w-4 rounded-sm border border-arcane-60 bg-arcane-60 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="h-4 w-4 rounded-sm border border-divider/50"></div>
                              )}
                            </div>
                            
                            <div>
                              <div className="font-medium">{issue.title}</div>
                              <div className="text-sm text-text-secondary mt-1">
                                {issue.description}
                              </div>
                            </div>
                          </div>
                          
                          <Badge 
                            variant={
                              issue.type === 'critical' 
                                ? 'destructive' 
                                : issue.type === 'warning'
                                  ? 'outline'
                                  : 'secondary'
                            }
                            className={
                              issue.type === 'warning'
                                ? 'bg-yellow-950/50 text-yellow-400 border-yellow-800/50'
                                : ''
                            }
                          >
                            {issue.type}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-text-secondary ml-6 mt-2 flex items-center">
                          <Wrench className="h-3 w-3 mr-1" />
                          Action: {issue.repairAction}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={toggleAllIssues}
                      disabled={isRepairing}
                    >
                      {selectedIssues.size === issues.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={scanForIssues}
                      disabled={isScanning || isRepairing}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Rescan
                    </Button>
                  </div>
                  
                  <div className="space-x-2">
                    <Button
                      onClick={repairSelectedIssues}
                      disabled={selectedIssues.size === 0 || isRepairing}
                    >
                      {isRepairing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Repairing...
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 mr-2" />
                          Repair Selected
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="arcane"
                      onClick={repairAllIssues}
                      disabled={issues.length === 0 || isRepairing}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Repair All
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <Check className="h-12 w-12 text-success mb-4" />
                <p className="font-medium">No Issues Found</p>
                <p className="text-sm text-text-secondary mt-1">
                  Your achievement data is in good shape!
                </p>
                <Button
                  variant="outline"
                  onClick={scanForIssues}
                  className="mt-4"
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4 mr-2" />
                  )}
                  Scan Again
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataRepairTools;
