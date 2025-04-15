import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/types/achievementTypes';
import { PlayCircle, FilePlus, Wrench, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import RequirementGapAnalyzer from './RequirementGapAnalyzer';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface RequirementGapAnalysisProps {
  achievement: Achievement;
  onGenerateData: () => void;
  onRepairData: () => void;
  onRunTest: () => void;
}

const RequirementGapAnalysis: React.FC<RequirementGapAnalysisProps> = ({
  achievement,
  onGenerateData,
  onRepairData,
  onRunTest
}) => {
  const { userAchievements, testService, refreshUserAchievements } = useTestingDashboard();
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isUnlocked = userAchievements[achievement.id]?.isUnlocked;
  
  // In a real implementation, we'd get actual values from the database
  // For this example, we'll simulate it with mock values
  const currentProgress = (achievement.requirements as any).currentValue || 2;
  const targetValue = achievement.requirements.value || 5;
  
  const handleGenerateRequirementData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, generate the exact amount of data needed
      await onGenerateData();
      toast.success('Requirement data generated', {
        description: `Generated data to meet requirement for ${achievement.name}`
      });
      await refreshUserAchievements();
    } catch (error) {
      toast.error('Failed to generate data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRunTest = async () => {
    setIsLoading(true);
    try {
      await onRunTest();
      toast.success('Achievement test completed', {
        description: `Test for ${achievement.name} completed`
      });
      await refreshUserAchievements();
    } catch (error) {
      toast.error('Failed to run test', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderRequirementTypeSpecificActions = () => {
    switch (achievement.requirements.type) {
      case 'WORKOUT_COUNT':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium">Generate Workouts</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                +1 Workout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                +3 Workouts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                +5 Workouts
              </Button>
            </div>
          </div>
        );
        
      case 'STREAK':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium">Set Streak Value</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                3 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                14 Days
              </Button>
            </div>
          </div>
        );
        
      case 'PR_COUNT':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium">Generate Personal Records</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                +1 PR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                +3 PRs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateRequirementData()}
                disabled={isLoading}
              >
                +5 PRs
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-2 rounded-md bg-midnight-elevated">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-valor mr-2 mt-0.5" />
              <p className="text-xs text-text-secondary">
                Custom actions for {achievement.requirements.type} requirements not yet implemented.
                Use the generic action buttons below.
              </p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      <RequirementGapAnalyzer
        achievement={achievement}
        currentProgress={currentProgress}
        targetValue={targetValue}
        onGenerateData={onGenerateData}
      />
      
      <Collapsible 
        open={isActionPanelOpen} 
        onOpenChange={setIsActionPanelOpen}
        className="border border-divider/30 rounded-md"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-midnight-elevated">
          Advanced Requirement Actions
          {isActionPanelOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-3 space-y-3">
          {renderRequirementTypeSpecificActions()}
          
          <Separator />
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRunTest}
              className="flex-1"
              disabled={isLoading}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Test Achievement
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateRequirementData}
              className="flex-1"
              disabled={isLoading}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Generate Data
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRepairData}
              className="flex-1"
              disabled={isLoading}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Repair Data
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default RequirementGapAnalysis;
