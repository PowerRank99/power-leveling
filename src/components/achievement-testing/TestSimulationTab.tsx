
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlarmClock, Award, Calendar, PlayCircle, RotateCw, Users, Hand } from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import SimulationTimeline from './simulation/SimulationTimeline';

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
      
      <SimulationTimeline userId={userId} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron">Simulation Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-arcane" />
                  <span>New User First Week</span>
                </div>
                <Button variant="outline" size="sm">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Simulates a new user completing their first 5 workouts over 7 days
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlarmClock className="h-4 w-4 mr-2 text-valor" />
                  <span>30-Day Consistency Challenge</span>
                </div>
                <Button variant="outline" size="sm">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Simulates a user working out consistently for 30 days straight
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <RotateCw className="h-4 w-4 mr-2 text-green-500" />
                  <span>PR Progress Journey</span>
                </div>
                <Button variant="outline" size="sm">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Simulates a user setting 10 personal records over time
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Guild Master Journey</span>
                </div>
                <Button variant="outline" size="sm">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Simulates a user creating and growing a guild with members
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron">Manual Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-secondary">
              Click any achievement to send a notification for it:
            </p>
            
            <div className="grid grid-cols-2 gap-2">
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
      </div>
    </div>
  );
};

export default TestSimulationTab;
