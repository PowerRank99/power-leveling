
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Wrench, Play, Database, Undo2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DataRepairToolsProps {
  userId: string;
  addLogEntry?: (action: string, details: string) => void;
}

const DataRepairTools: React.FC<DataRepairToolsProps> = ({ userId, addLogEntry }) => {
  const [repairing, setRepairing] = useState(false);
  const [repairType, setRepairType] = useState<'streak' | 'xp' | 'achievement' | 'pr' | 'workout' | null>(null);
  const [detectedIssues, setDetectedIssues] = useState<Array<{
    id: string;
    tableName: string;
    description: string;
    repairAction: string;
    severity: 'low' | 'medium' | 'high';
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  
  const runDiagnostics = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, we would run a comprehensive database check
      // For demo purposes, we'll simulate detecting issues
      
      setTimeout(() => {
        const mockIssues = [
          {
            id: '1',
            tableName: 'profiles',
            description: 'User streak count out of sync with workout history',
            repairAction: 'Recalculate streak based on workout history',
            severity: 'medium' as const
          },
          {
            id: '2',
            tableName: 'user_achievements',
            description: 'Duplicate achievement unlocks found',
            repairAction: 'Remove duplicate entries',
            severity: 'low' as const
          },
          {
            id: '3',
            tableName: 'workout_sets',
            description: 'Orphaned workout sets with no parent workout',
            repairAction: 'Delete orphaned records',
            severity: 'high' as const
          }
        ];
        
        setDetectedIssues(mockIssues);
        toast.success('Diagnostics completed', {
          description: `${mockIssues.length} issues detected`
        });
        
        if (addLogEntry) {
          addLogEntry('Diagnostics Completed', `${mockIssues.length} issues detected`);
        }
        
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast.error('Error running diagnostics', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setLoading(false);
    }
  };
  
  const repairIssue = async (issueId: string) => {
    setLoading(true);
    
    try {
      // In a real implementation, we would run a specific repair action
      // For demo purposes, we'll simulate repairing
      
      setTimeout(() => {
        setDetectedIssues(prev => 
          prev.filter(issue => issue.id !== issueId)
        );
        
        toast.success('Issue repaired', {
          description: 'The selected data inconsistency has been fixed'
        });
        
        if (addLogEntry) {
          const issue = detectedIssues.find(i => i.id === issueId);
          addLogEntry('Issue Repaired', 
            `Fixed: ${issue?.description || 'Unknown issue'}`
          );
        }
        
        setLoading(false);
      }, 1500);
    } catch (error) {
      toast.error('Error repairing issue', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setLoading(false);
    }
  };
  
  const repairAllIssues = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, we would run repairs for all issues
      // For demo purposes, we'll simulate repairing all
      
      setTimeout(() => {
        const count = detectedIssues.length;
        setDetectedIssues([]);
        
        toast.success('All issues repaired', {
          description: `${count} data inconsistencies have been fixed`
        });
        
        if (addLogEntry) {
          addLogEntry('Bulk Repair Completed', 
            `Fixed ${count} data inconsistencies`
          );
        }
        
        setLoading(false);
      }, 3000);
    } catch (error) {
      toast.error('Error repairing issues', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setLoading(false);
    }
  };
  
  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // In a real implementation, we would execute the query against the database
      // For demo purposes, we'll simulate execution
      
      setTimeout(() => {
        toast.success('Query executed successfully', {
          description: 'Custom repair action completed'
        });
        
        if (addLogEntry) {
          addLogEntry('Custom Query Executed', customQuery.substring(0, 50) + '...');
        }
        
        setCustomQuery('');
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Error executing query', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setLoading(false);
    }
  };
  
  const startRepair = (type: 'streak' | 'xp' | 'achievement' | 'pr' | 'workout') => {
    setRepairType(type);
    setRepairing(true);
  };
  
  const finishRepair = () => {
    setRepairType(null);
    setRepairing(false);
    
    toast.success('Repair completed', {
      description: 'The selected data has been repaired'
    });
    
    if (addLogEntry) {
      addLogEntry('Repair Completed', `${repairType} data repaired`);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-arcane" />
              Data Repair Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Common Repairs</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => startRepair('streak')}
                  disabled={repairing || loading}
                >
                  Repair Streak Data
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => startRepair('xp')}
                  disabled={repairing || loading}
                >
                  Repair XP Calculations
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => startRepair('achievement')}
                  disabled={repairing || loading}
                >
                  Fix Achievement States
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => startRepair('pr')}
                  disabled={repairing || loading}
                >
                  Validate Personal Records
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => startRepair('workout')}
                  disabled={repairing || loading}
                  className="col-span-2"
                >
                  Clean Workout Data
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {repairing ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold capitalize">
                    {repairType} Repair
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setRepairing(false)}
                    disabled={loading}
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
                
                <div className="bg-midnight-elevated p-3 rounded-md space-y-2">
                  <p className="text-sm text-text-secondary">
                    {repairType === 'streak' && "This will recalculate the user's streak based on their workout history."}
                    {repairType === 'xp' && "This will validate and correct the user's XP calculations based on their activities."}
                    {repairType === 'achievement' && "This will verify achievement unlock states and fix any inconsistencies."}
                    {repairType === 'pr' && "This will validate all personal records and ensure they match workout history."}
                    {repairType === 'workout' && "This will clean up incomplete workouts and orphaned workout data."}
                  </p>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="arcane" 
                      size="sm"
                      onClick={finishRepair}
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Execute Repair
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Advanced Options</h4>
                
                <div className="bg-midnight-elevated p-3 rounded-md space-y-3">
                  <p className="text-sm text-text-secondary">
                    Run system-wide diagnostics to detect data inconsistencies
                  </p>
                  
                  <Button 
                    variant="secondary" 
                    onClick={runDiagnostics}
                    disabled={loading}
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Run Diagnostics
                  </Button>
                </div>
                
                <div className="bg-midnight-elevated p-3 rounded-md space-y-3">
                  <p className="text-sm text-text-secondary">
                    Execute custom repair query (for advanced users)
                  </p>
                  
                  <Input 
                    placeholder="Enter SQL or repair command..." 
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    disabled={loading}
                    className="bg-midnight-card border-divider"
                  />
                  
                  <Button 
                    variant="secondary" 
                    onClick={executeCustomQuery}
                    disabled={loading || !customQuery.trim()}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute Custom Repair
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron flex items-center">
              <Database className="h-5 w-5 mr-2 text-arcane" />
              Detected Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detectedIssues.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {detectedIssues.length} issues detected
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={repairAllIssues}
                    disabled={loading}
                  >
                    Repair All
                  </Button>
                </div>
                
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {detectedIssues.map(issue => (
                      <div 
                        key={issue.id}
                        className="bg-midnight-elevated p-3 rounded-md space-y-2 border border-divider/30"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              className={
                                issue.severity === 'high' ? 'bg-valor' : 
                                issue.severity === 'medium' ? 'bg-amber-500' :
                                'bg-blue-500'
                              }
                            >
                              {issue.severity}
                            </Badge>
                            <h4 className="text-sm font-semibold mt-1">
                              {issue.description}
                            </h4>
                          </div>
                          
                          <Badge variant="outline">
                            {issue.tableName}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-text-secondary">
                          Action: {issue.repairAction}
                        </p>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => repairIssue(issue.id)}
                            disabled={loading}
                          >
                            <Wrench className="h-3 w-3 mr-1" />
                            Repair
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[340px] text-text-tertiary">
                <Database className="h-12 w-12 mb-4 opacity-40" />
                <p>No issues detected</p>
                <p className="text-sm mt-2">
                  Run diagnostics to find and fix data inconsistencies
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataRepairTools;
