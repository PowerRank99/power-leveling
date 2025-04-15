
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, AlertTriangle, WrenchIcon, 
  RefreshCw, CheckCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DataRepairToolsProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const DataRepairTools: React.FC<DataRepairToolsProps> = ({ userId, addLogEntry }) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [issues, setIssues] = useState<Array<{
    id: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>>([]);
  
  const detectIssues = async () => {
    setIsRepairing(true);
    try {
      // Check for common data inconsistencies
      const detectedIssues = [];
      
      // Check for orphaned achievement progress
      const { data: orphanedProgress } = await supabase
        .from('achievement_progress')
        .select('id')
        .eq('user_id', userId)
        .is('achievement_id', null);
        
      if (orphanedProgress?.length) {
        detectedIssues.push({
          id: 'orphaned-progress',
          type: 'Orphaned Progress',
          description: `Found ${orphanedProgress.length} achievement progress records without achievements`,
          severity: 'medium'
        });
      }
      
      // Check for inconsistent unlock states
      const { data: inconsistentStates } = await supabase
        .from('achievement_progress')
        .select('id, achievement_id')
        .eq('user_id', userId)
        .eq('is_complete', true)
        .not('achievement_id', 'in', `(
          select achievement_id from user_achievements 
          where user_id = '${userId}'
        )`);
        
      if (inconsistentStates?.length) {
        detectedIssues.push({
          id: 'inconsistent-states',
          type: 'Inconsistent States',
          description: `Found ${inconsistentStates.length} completed achievements not marked as unlocked`,
          severity: 'high'
        });
      }
      
      setIssues(detectedIssues);
      addLogEntry('Issue Detection', `Found ${detectedIssues.length} potential issues`);
      
    } catch (error) {
      console.error('Error detecting issues:', error);
      addLogEntry('Error', 'Failed to detect data issues');
    } finally {
      setIsRepairing(false);
    }
  };
  
  const repairIssue = async (issueId: string) => {
    setIsRepairing(true);
    try {
      switch (issueId) {
        case 'orphaned-progress':
          await supabase
            .from('achievement_progress')
            .delete()
            .eq('user_id', userId)
            .is('achievement_id', null);
          break;
          
        case 'inconsistent-states':
          // First, get all completed achievements
          const { data: completed } = await supabase
            .from('achievement_progress')
            .select('achievement_id')
            .eq('user_id', userId)
            .eq('is_complete', true);
            
          if (completed && completed.length > 0) {
            // Insert missing unlocks
            await supabase.from('user_achievements').upsert(
              completed.map(c => ({
                user_id: userId,
                achievement_id: c.achievement_id,
                achieved_at: new Date().toISOString()
              }))
            );
          }
          break;
      }
      
      setIssues(prev => prev.filter(i => i.id !== issueId));
      addLogEntry('Repair Complete', `Successfully repaired issue: ${issueId}`);
      
    } catch (error) {
      console.error('Error repairing issue:', error);
      addLogEntry('Error', `Failed to repair issue: ${issueId}`);
    } finally {
      setIsRepairing(false);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-arcane" />
          <h3 className="font-semibold">Data Integrity Check</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={detectIssues}
          disabled={isRepairing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Scan for Issues
        </Button>
      </div>
      
      {issues.length > 0 ? (
        <div className="space-y-3">
          {issues.map(issue => (
            <div
              key={issue.id}
              className="flex items-start justify-between p-3 border border-divider/30 rounded-md"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-valor" />
                  <span className="font-medium">{issue.type}</span>
                  <Badge variant={
                    issue.severity === 'high' ? 'valor' :
                    issue.severity === 'medium' ? 'achievement' : // Changed from 'warning' to 'achievement'
                    'outline'
                  }>
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  {issue.description}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => repairIssue(issue.id)}
                disabled={isRepairing}
              >
                <WrenchIcon className="h-4 w-4 mr-2" />
                Repair
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 text-text-secondary">
          <CheckCircle className="h-5 w-5 mr-2 text-success" />
          <span>No data issues detected</span>
        </div>
      )}
    </Card>
  );
};

export default DataRepairTools;
