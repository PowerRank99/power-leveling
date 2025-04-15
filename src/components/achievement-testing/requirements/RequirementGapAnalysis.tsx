
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/types/achievementTypes';
import { PlayCircle, FilePlus, Wrench } from 'lucide-react'; // Changed Tool to Wrench
import RequirementGapAnalyzer from './RequirementGapAnalyzer';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';

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
  const { userAchievements } = useTestingDashboard();
  const isUnlocked = userAchievements[achievement.id]?.isUnlocked;
  
  // For this example, we'll use mock values
  const currentProgress = 5;
  const targetValue = achievement.requirements.value;
  
  return (
    <div className="space-y-4">
      <RequirementGapAnalyzer
        achievement={achievement}
        currentProgress={currentProgress}
        targetValue={targetValue}
        onGenerateData={onGenerateData}
      />
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRunTest}
          className="flex-1"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Test Achievement
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateData}
          className="flex-1"
        >
          <FilePlus className="h-4 w-4 mr-2" />
          Generate Data
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRepairData}
          className="flex-1"
        >
          <Wrench className="h-4 w-4 mr-2" /> {/* Changed Tool to Wrench */}
          Repair Data
        </Button>
      </div>
    </div>
  );
};

export default RequirementGapAnalysis;
