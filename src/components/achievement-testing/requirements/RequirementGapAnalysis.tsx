
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BarChart2,
  Play,
  Wrench
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types/achievementTypes';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';

interface RequirementGapAnalysisProps {
  achievement: Achievement;
  onGenerateData?: () => void;
  onRepairData?: () => void;
  onRunTest?: () => void;
}

interface RequirementStatus {
  name: string;
  satisfied: boolean;
  currentValue: number | string;
  targetValue: number | string;
  percentComplete?: number;
  missingData?: boolean;
}

const RequirementGapAnalysis: React.FC<RequirementGapAnalysisProps> = ({
  achievement,
  onGenerateData,
  onRepairData,
  onRunTest
}) => {
  const { testResults, userAchievements } = useTestingDashboard();
  const isUnlocked = userAchievements[achievement.id]?.isUnlocked || false;
  const testResult = testResults.find(r => r.achievementId === achievement.id);
  
  // Parse requirements
  const requirementsList: RequirementStatus[] = [];
  
  if (achievement.requirements) {
    // In a real implementation, we would parse the actual requirements and compare with user's data
    // This is a placeholder for demonstration purposes
    
    const mockRequirements = [
      {
        name: 'Workout Count',
        satisfied: Math.random() > 0.3,
        currentValue: Math.floor(Math.random() * 20),
        targetValue: 10,
        percentComplete: Math.min(100, Math.floor(Math.random() * 120))
      },
      {
        name: 'Streak Days',
        satisfied: Math.random() > 0.5,
        currentValue: Math.floor(Math.random() * 14),
        targetValue: 7,
        percentComplete: Math.min(100, Math.floor(Math.random() * 150))
      },
      {
        name: 'Personal Records',
        satisfied: Math.random() > 0.7,
        currentValue: Math.floor(Math.random() * 5),
        targetValue: 3,
        percentComplete: Math.min(100, Math.floor(Math.random() * 110))
      }
    ];
    
    requirementsList.push(...mockRequirements);
  }
  
  const allSatisfied = requirementsList.length > 0 && requirementsList.every(r => r.satisfied);
  
  return (
    <Card className="border-divider/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-orbitron flex items-center">
          <BarChart2 className="mr-2 h-4 w-4 text-arcane" />
          Requirement Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isUnlocked ? (
              <Badge className="bg-arcane text-white">Unlocked</Badge>
            ) : allSatisfied ? (
              <Badge className="bg-success text-white">Ready to Unlock</Badge>
            ) : (
              <Badge variant="outline">Not Unlocked</Badge>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateData}
              className="text-xs h-8"
            >
              <Play className="h-3 w-3 mr-1" />
              Generate Data
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRepairData}
              className="text-xs h-8"
            >
              <Wrench className="h-3 w-3 mr-1" />
              Repair
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onRunTest}
              className="text-xs h-8"
            >
              Test
            </Button>
          </div>
        </div>
        
        {testResult && (
          <div className={`p-2 rounded-md text-sm ${
            testResult.success ? 'bg-success/10 border border-success/30' : 'bg-valor/10 border border-valor/30'
          }`}>
            <div className="flex items-center">
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-success mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-valor mr-2" />
              )}
              <span>
                {testResult.success ? 'Test passed' : 'Test failed'}
                {testResult.errorMessage && `: ${testResult.errorMessage}`}
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Requirements</h4>
          
          {requirementsList.length > 0 ? (
            requirementsList.map((req, index) => (
              <div key={index} className="bg-midnight-elevated p-3 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {req.satisfied ? (
                      <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                    ) : req.missingData ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-valor mr-2" />
                    )}
                    <span className="font-semibold">{req.name}</span>
                  </div>
                  <Badge variant="outline" className={req.satisfied ? 'border-success text-success' : 'border-valor text-valor'}>
                    {req.currentValue} / {req.targetValue}
                  </Badge>
                </div>
                
                {typeof req.percentComplete === 'number' && (
                  <Progress 
                    value={req.percentComplete} 
                    className="h-1.5" 
                    color={req.satisfied ? 'success' : 'valor'}
                  />
                )}
                
                {!req.satisfied && !req.missingData && (
                  <div className="text-xs text-text-tertiary flex justify-between items-center">
                    <span>
                      {typeof req.percentComplete === 'number' 
                        ? `${req.percentComplete}% complete` 
                        : 'Progress not available'}
                    </span>
                    
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-arcane"
                      onClick={() => {
                        // This would trigger a targeted data generation for this specific requirement
                        if (onGenerateData) onGenerateData();
                      }}
                    >
                      Generate Required Data
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-text-tertiary text-sm p-4 text-center">
              No detailed requirements available for analysis
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RequirementGapAnalysis;
