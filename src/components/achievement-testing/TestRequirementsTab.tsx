
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Microscope, AlignStartHorizontal } from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import AchievementDependencyGraph from './requirements/AchievementDependencyGraph';
import RequirementGapAnalysis from './requirements/RequirementGapAnalysis';

interface TestRequirementsTabProps {
  userId: string;
}

const TestRequirementsTab: React.FC<TestRequirementsTabProps> = ({ userId }) => {
  const { 
    allAchievements, 
    userAchievements, 
    runTests, 
    generateTestData
  } = useTestingDashboard();
  
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | undefined>();
  
  const selectedAchievement = allAchievements.find(a => a.id === selectedAchievementId);
  
  const handleRunTest = () => {
    if (selectedAchievementId) {
      runTests([selectedAchievementId]);
    }
  };
  
  const handleGenerateData = () => {
    // In a real implementation, we would generate targeted data for the selected achievement
    generateTestData();
  };
  
  const handleRepairData = () => {
    // This would be a specialized repair function for the selected achievement
    // For now, we'll just call the general data generation function
    generateTestData();
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-arcane-15 border-arcane-30">
        <Microscope className="h-4 w-4 text-arcane" />
        <AlertTitle>Requirements Analysis</AlertTitle>
        <AlertDescription>
          Analyze achievement requirements, identify gaps in user progress, and visualize dependencies between achievements.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AchievementDependencyGraph 
            achievements={allAchievements} 
            selectedAchievementId={selectedAchievementId}
            onSelectAchievement={setSelectedAchievementId}
          />
        </div>
        
        <div>
          <Card className="h-full">
            <CardContent className="p-3 h-full">
              <div className="flex flex-col h-full">
                <h3 className="text-md font-orbitron mb-3 flex items-center">
                  <AlignStartHorizontal className="mr-2 h-4 w-4 text-arcane" />
                  Achievement Details
                </h3>
                
                {selectedAchievement ? (
                  <ScrollArea className="flex-grow">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold">{selectedAchievement.name}</h4>
                        <p className="text-text-secondary text-sm">{selectedAchievement.description}</p>
                        <div className="flex space-x-2 text-sm">
                          <span className="text-text-tertiary">Category: </span>
                          <span>{selectedAchievement.category}</span>
                        </div>
                        <div className="flex space-x-2 text-sm">
                          <span className="text-text-tertiary">Rank: </span>
                          <span>{selectedAchievement.rank}</span>
                        </div>
                        <div className="flex space-x-2 text-sm">
                          <span className="text-text-tertiary">Points: </span>
                          <span>{selectedAchievement.points}</span>
                        </div>
                        <div className="flex space-x-2 text-sm">
                          <span className="text-text-tertiary">XP Reward: </span>
                          <span>{selectedAchievement.xpReward}</span>
                        </div>
                      </div>
                      
                      <RequirementGapAnalysis
                        achievement={selectedAchievement}
                        onGenerateData={handleGenerateData}
                        onRepairData={handleRepairData}
                        onRunTest={handleRunTest}
                      />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-text-tertiary text-center p-4">
                    <div>
                      <p>No achievement selected</p>
                      <p className="text-sm mt-2">
                        Click on any achievement in the dependency graph to view its details
                        and analyze its requirements.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestRequirementsTab;
