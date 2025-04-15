
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlarmClock, Award, Calendar, PlayCircle, RotateCw, Users, Hand } from 'lucide-react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import SimulationTimeline from './simulation/SimulationTimeline';
import StepByStepSimulation from './simulation/StepByStepSimulation';
import TestSequenceBuilder from './sequence/TestSequenceBuilder';

interface TestSimulationTabProps {
  userId: string;
}

const TestSimulationTab: React.FC<TestSimulationTabProps> = ({ userId }) => {
  const { simulateAchievement, allAchievements } = useTestingDashboard();
  
  // Pick some random achievements for demo purposes
  const randomAchievements = React.useMemo(() => {
    const shuffled = [...allAchievements].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [allAchievements]);
  
  return (
    <div className="space-y-4">
      <Alert className="bg-arcane-15 border-arcane-30">
        <Award className="h-4 w-4 text-arcane" />
        <AlertTitle>Achievement Simulation</AlertTitle>
        <AlertDescription>
          Simulate the user journey to earning achievements. Choose scenarios to run or create custom achievement sequences.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stepbystep">Step-by-Step</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="manual">Manual Triggers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="pt-4">
          <SimulationTimeline userId={userId} />
        </TabsContent>
        
        <TabsContent value="stepbystep" className="pt-4">
          <StepByStepSimulation />
        </TabsContent>
        
        <TabsContent value="sequences" className="pt-4">
          <TestSequenceBuilder />
        </TabsContent>
        
        <TabsContent value="manual" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-orbitron">Manual Achievement Triggers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">
                Click any achievement to send a notification for it:
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {randomAchievements.map(achievement => (
                  <Button 
                    key={achievement.id}
                    variant="outline"
                    className="justify-start overflow-hidden"
                    onClick={() => simulateAchievement(achievement.id)}
                  >
                    <Hand className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{achievement.name}</span>
                  </Button>
                ))}
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="arcane"
                  onClick={() => {
                    // Simulate a random achievement every 3 seconds
                    const interval = setInterval(() => {
                      const randomIndex = Math.floor(Math.random() * allAchievements.length);
                      simulateAchievement(allAchievements[randomIndex].id);
                    }, 3000);
                    
                    // Stop after 5 achievements
                    setTimeout(() => {
                      clearInterval(interval);
                    }, 15000);
                  }}
                  className="w-full"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Simulate Achievement Sequence
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestSimulationTab;
