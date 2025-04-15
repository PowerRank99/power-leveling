
import React, { useState } from 'react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import RequirementGapAnalysis from './requirements/RequirementGapAnalysis';
import AchievementDependencyGraph from './requirements/AchievementDependencyGraph';
import CustomRequirementDefinition from './requirements/CustomRequirementDefinition';

interface TestRequirementsTabProps {
  userId: string;
}

const TestRequirementsTab: React.FC<TestRequirementsTabProps> = ({ userId }) => {
  const { allAchievements, userAchievements } = useTestingDashboard();
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  
  // Find the selected achievement object
  const achievementObject = selectedAchievement 
    ? allAchievements.find(a => a.id === selectedAchievement) 
    : null;
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="gap-analysis">
        <TabsList>
          <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="patterns">Custom Patterns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gap-analysis" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Achievement Selection</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <select 
                  className="w-full p-2 rounded-md border border-divider/30 bg-midnight-card"
                  value={selectedAchievement || ''}
                  onChange={(e) => setSelectedAchievement(e.target.value)}
                >
                  <option value="">Select an achievement</option>
                  {allAchievements.map(achievement => (
                    <option 
                      key={achievement.id} 
                      value={achievement.id}
                    >
                      {achievement.name}
                    </option>
                  ))}
                </select>
                
                {achievementObject && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{achievementObject.name}</h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {achievementObject.description}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Category:</span>
                        <span className="font-medium capitalize">{achievementObject.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rank:</span>
                        <span className="font-medium">{achievementObject.rank}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>XP Reward:</span>
                        <span className="font-medium">{achievementObject.xpReward}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Points:</span>
                        <span className="font-medium">{achievementObject.points}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className={`font-medium ${userAchievements[achievementObject.id]?.isUnlocked ? 'text-success' : 'text-text-tertiary'}`}>
                          {userAchievements[achievementObject.id]?.isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Requirement Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {achievementObject ? (
                  <RequirementGapAnalysis 
                    achievement={achievementObject}
                    onGenerateData={() => {
                      // Add generate data logic here
                      console.log('Generate data for', achievementObject.id);
                    }}
                    onRepairData={() => {
                      // Add repair data logic here
                      console.log('Repair data for', achievementObject.id);
                    }}
                    onRunTest={() => {
                      // Add test run logic here
                      console.log('Run test for', achievementObject.id);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary">
                    <p>Select an achievement to analyze its requirements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="dependencies" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Achievement Dependencies</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <AchievementDependencyGraph />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patterns" className="pt-4">
          <CustomRequirementDefinition />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestRequirementsTab;
