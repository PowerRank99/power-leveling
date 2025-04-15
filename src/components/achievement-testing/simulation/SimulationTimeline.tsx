
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { 
  Calendar, Award, ArrowRight, PlayCircle, Pause, 
  SkipForward, FastForward, RotateCcw, Flame
} from 'lucide-react';
import { toast } from 'sonner';

interface SimulationTimelineProps {
  userId: string;
}

interface TimelineEvent {
  id: string;
  day: number;
  type: 'workout' | 'achievement' | 'streak' | 'pr' | 'level';
  description: string;
  achievementId?: string;
  animation?: string;
}

const SimulationTimeline: React.FC<SimulationTimelineProps> = ({ userId }) => {
  const { simulateAchievement } = useTestingDashboard();
  const [currentDay, setCurrentDay] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  // Define a timeline of events
  const timelineEvents: TimelineEvent[] = [
    // Day 1
    { id: '1', day: 1, type: 'workout', description: 'First workout completed' },
    { id: '2', day: 1, type: 'achievement', description: 'Primeiro Treino', achievementId: 'primeiro-treino' },
    
    // Day 2
    { id: '3', day: 2, type: 'workout', description: 'Second workout completed' },
    
    // Day 3
    { id: '4', day: 3, type: 'workout', description: 'Third workout completed' },
    { id: '5', day: 3, type: 'streak', description: '3-day streak achieved' },
    { id: '6', day: 3, type: 'achievement', description: 'Trinca Poderosa', achievementId: 'trinca-poderosa' },
    
    // Day 4
    { id: '7', day: 4, type: 'workout', description: 'Fourth workout completed' },
    { id: '8', day: 4, type: 'pr', description: 'Personal record set' },
    { id: '9', day: 4, type: 'achievement', description: 'PR First', achievementId: 'pr-first' },
    
    // Day 5
    { id: '10', day: 5, type: 'workout', description: 'Fifth workout completed' },
    { id: '11', day: 5, type: 'achievement', description: 'Embalo Fitness', achievementId: 'embalo-fitness' },
    
    // Day 7
    { id: '12', day: 7, type: 'workout', description: 'Seventh workout completed' },
    { id: '13', day: 7, type: 'streak', description: '7-day streak achieved' },
    { id: '14', day: 7, type: 'achievement', description: 'Semana Impecável', achievementId: 'semana-impecavel' },
    
    // Day 10
    { id: '15', day: 10, type: 'level', description: 'Reached Level 5' },
    { id: '16', day: 10, type: 'achievement', description: 'Herói em Ascensão', achievementId: 'level-5' },
    
    // Day 14
    { id: '17', day: 14, type: 'streak', description: '14-day streak achieved' },
    { id: '18', day: 14, type: 'achievement', description: 'Dedicação Total', achievementId: 'streak-14' },
  ];
  
  // Get events for the current day
  const currentDayEvents = timelineEvents.filter(event => event.day <= currentDay);
  
  // Start the simulation
  const startSimulation = () => {
    setIsRunning(true);
    
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Set up interval for advancing days
    const id = setInterval(() => {
      setCurrentDay(prev => {
        const nextDay = prev + 1;
        
        // Process events for the new day
        const newDayEvents = timelineEvents.filter(event => event.day === nextDay);
        
        // Simulate achievements
        newDayEvents.forEach(event => {
          if (event.type === 'achievement' && event.achievementId) {
            simulateAchievement(event.achievementId);
          }
          
          // Show toast for event
          toast.info(`Day ${nextDay}: ${event.type.toUpperCase()}`, {
            description: event.description
          });
        });
        
        // Check if we've reached the end of the timeline
        if (nextDay > Math.max(...timelineEvents.map(e => e.day))) {
          stopSimulation();
        }
        
        return nextDay;
      });
    }, 3000 / simulationSpeed);
    
    setIntervalId(id);
  };
  
  // Stop the simulation
  const stopSimulation = () => {
    setIsRunning(false);
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };
  
  // Reset the simulation
  const resetSimulation = () => {
    stopSimulation();
    setCurrentDay(1);
  };
  
  // Skip to next day with events
  const skipToNextDay = () => {
    const nextDayWithEvents = timelineEvents
      .filter(event => event.day > currentDay)
      .sort((a, b) => a.day - b.day)[0]?.day;
      
    if (nextDayWithEvents) {
      setCurrentDay(nextDayWithEvents);
      
      // Simulate achievements for this day
      timelineEvents
        .filter(event => event.day === nextDayWithEvents && event.type === 'achievement' && event.achievementId)
        .forEach(event => {
          simulateAchievement(event.achievementId!);
        });
    }
  };
  
  // Skip to end
  const skipToEnd = () => {
    const lastDay = Math.max(...timelineEvents.map(e => e.day));
    setCurrentDay(lastDay);
    stopSimulation();
  };
  
  // Get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <div className="w-5 h-5 rounded-full bg-arcane-60 flex items-center justify-center text-xs">W</div>;
      case 'achievement':
        return <Award className="h-5 w-5 text-achievement" />;
      case 'streak':
        return <Flame className="h-5 w-5 text-valor" />;
      case 'pr':
        return <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-xs">PR</div>;
      case 'level':
        return <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-xs">LV</div>;
      default:
        return <div className="w-5 h-5 rounded-full bg-text-tertiary flex items-center justify-center text-xs">?</div>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Calendar className="mr-2 h-5 w-5 text-arcane" />
          Achievement Timeline
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Badge 
              variant={isRunning ? 'arcane' : 'outline'}
              className="mr-2"
            >
              {isRunning ? 'Running' : 'Day'} {currentDay}
            </Badge>
            
            {isRunning && (
              <Badge variant="outline">
                Speed: {simulationSpeed}x
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isRunning && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetSimulation}
                  disabled={currentDay === 1}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSimulationSpeed(prev => Math.min(prev + 1, 5))}
                >
                  +
                </Button>
                
                <span className="text-sm">{simulationSpeed}x</span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSimulationSpeed(prev => Math.max(prev - 1, 1))}
                >
                  -
                </Button>
              </>
            )}
            
            {isRunning ? (
              <Button
                size="sm"
                onClick={stopSimulation}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={startSimulation}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Play
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={skipToNextDay}
              disabled={isRunning || currentDay >= Math.max(...timelineEvents.map(e => e.day))}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={skipToEnd}
              disabled={isRunning || currentDay >= Math.max(...timelineEvents.map(e => e.day))}
            >
              <FastForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="relative border-l-2 border-divider/30 pl-4 space-y-4 ml-2">
            {currentDayEvents.map((event, index) => (
              <div 
                key={event.id}
                className={`relative ${
                  event.type === 'achievement' 
                    ? 'bg-arcane-15 border border-arcane-30' 
                    : 'bg-midnight-card border border-divider/30'
                } rounded-md p-3`}
              >
                <div className="absolute -left-6 top-4">
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <Badge 
                      variant={event.type === 'achievement' ? 'arcane' : 'outline'}
                      className="mb-1 capitalize"
                    >
                      {event.type}
                    </Badge>
                    <div className="text-sm">
                      <div className="font-medium">{event.description}</div>
                      <div className="text-xs text-text-secondary mt-1">
                        Day {event.day}
                      </div>
                    </div>
                  </div>
                  
                  {event.type === 'achievement' && event.achievementId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => simulateAchievement(event.achievementId!)}
                    >
                      <Award className="h-3 w-3 mr-1" />
                      Show
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {currentDay < Math.max(...timelineEvents.map(e => e.day)) && (
              <div className="flex items-center gap-2 text-text-secondary text-sm ml-3 mt-2">
                <ArrowRight className="h-4 w-4" />
                Continue to day {Math.min(...timelineEvents.filter(e => e.day > currentDay).map(e => e.day))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SimulationTimeline;
