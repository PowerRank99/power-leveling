import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play, Pause, SkipBack, SkipForward, 
  FastForward, Clock, RotateCcw, Calendar,
  StepForward, StepBack
} from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

// Simulation Event types
interface SimulationEvent {
  id: string;
  type: 'workout' | 'manual_workout' | 'personal_record' | 'guild_join' | 'class_change' | 'level_up' | 'xp_gain';
  timestamp: Date;
  data: Record<string, any>;
  completed: boolean;
  triggeredAchievements: Array<{id: string, name: string}>;
}

// Define simulation speeds
const SIMULATION_SPEEDS = [
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '5x', value: 5 },
  { label: '10x', value: 10 }
];

const StepByStepSimulation: React.FC = () => {
  const { userId, simulateAchievement } = useTestingDashboard();
  
  // Simulation state
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  
  // For interval management
  const intervalRef = useRef<number | null>(null);
  
  // Current event getter
  const currentEvent = events[currentIndex];
  
  // Sample event generator (replace with your real implementation)
  const generateSampleEvents = () => {
    const now = new Date();
    const newEvents: SimulationEvent[] = [];
    
    // Generate a series of events for demonstration
    for (let i = 0; i < 10; i++) {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() - (10 - i));
      
      const eventTypes = ['workout', 'manual_workout', 'personal_record', 'guild_join', 'class_change', 'level_up', 'xp_gain'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as SimulationEvent['type'];
      
      newEvents.push({
        id: `event-${i}`,
        type: randomType,
        timestamp: eventDate,
        data: {
          // Sample data based on event type
          exerciseCount: Math.floor(Math.random() * 5) + 1,
          duration: Math.floor(Math.random() * 60) + 30,
          xpGained: Math.floor(Math.random() * 100) + 50
        },
        completed: false,
        triggeredAchievements: []
      });
    }
    
    return newEvents;
  };
  
  // Start simulation with sample events
  const startSimulation = () => {
    const sampleEvents = generateSampleEvents();
    setEvents(sampleEvents);
    setCurrentIndex(0);
    setProgress(0);
    setIsPlaying(false);
  };
  
  // Play/pause the simulation
  const togglePlayPause = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (currentIndex < events.length) {
      intervalRef.current = window.setInterval(() => {
        advanceSimulation();
      }, 1000 / speed);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Step forward in simulation
  const stepForward = () => {
    if (currentIndex < events.length - 1) {
      processEvent(currentIndex);
      setCurrentIndex(currentIndex + 1);
      setProgress((currentIndex + 1) / events.length * 100);
    }
  };
  
  // Step backward in simulation
  const stepBackward = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(currentIndex / events.length * 100);
    }
  };
  
  // Skip to the beginning
  const skipToStart = () => {
    setCurrentIndex(0);
    setProgress(0);
  };
  
  // Skip to the end
  const skipToEnd = () => {
    // Process all events
    for (let i = currentIndex; i < events.length; i++) {
      processEvent(i);
    }
    setCurrentIndex(events.length - 1);
    setProgress(100);
  };
  
  // Reset the simulation
  const resetSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsPlaying(false);
    setEvents([]);
    setCurrentIndex(0);
    setProgress(0);
  };
  
  // Change simulation speed
  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    
    // Restart interval with new speed if playing
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        advanceSimulation();
      }, 1000 / newSpeed);
    }
  };
  
  // Process the current event
  const processEvent = (index: number) => {
    const event = events[index];
    if (!event || event.completed) return;
    
    // Mark as completed
    const updatedEvents = [...events];
    updatedEvents[index] = {
      ...event,
      completed: true,
      // Simulate achievements triggered by this event (for demo purposes)
      triggeredAchievements: event.type === 'workout' ? [
        { id: 'workout-achievement', name: 'Workout Master' }
      ] : []
    };
    
    setEvents(updatedEvents);
    
    // Trigger achievement notification for any triggered achievements
    updatedEvents[index].triggeredAchievements.forEach(achievement => {
      simulateAchievement(achievement.id);
    });
  };
  
  // Advance the simulation
  const advanceSimulation = () => {
    if (currentIndex < events.length - 1) {
      processEvent(currentIndex);
      setCurrentIndex(prev => prev + 1);
      setProgress((currentIndex + 1) / events.length * 100);
    } else {
      // End of simulation
      processEvent(currentIndex);
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <Card className="border-arcane-30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Clock className="mr-2 h-5 w-5 text-arcane" />
          Step-by-Step Simulation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary">
            <p>No simulation active</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={startSimulation}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Sample Simulation
            </Button>
          </div>
        ) : (
          <>
            {/* Simulation progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Progress</span>
                <span className="text-sm text-text-secondary">
                  Event {currentIndex + 1} of {events.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Simulation controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={skipToStart}
                  disabled={currentIndex === 0 || isPlaying}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={stepBackward}
                  disabled={currentIndex === 0 || isPlaying}
                >
                  <StepBack className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant={isPlaying ? "valor" : "arcane"}
                  size="icon"
                  onClick={togglePlayPause}
                  disabled={currentIndex >= events.length - 1 && isPlaying}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={stepForward}
                  disabled={currentIndex >= events.length - 1 || isPlaying}
                >
                  <StepForward className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={skipToEnd}
                  disabled={currentIndex >= events.length - 1 || isPlaying}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">Speed:</span>
                {SIMULATION_SPEEDS.map(s => (
                  <Button
                    key={s.value}
                    variant={speed === s.value ? "arcane" : "outline"}
                    size="sm"
                    onClick={() => changeSpeed(s.value)}
                    className="min-w-[40px]"
                  >
                    {s.label}
                  </Button>
                ))}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetSimulation}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Current event details */}
            <div className="border border-divider/30 rounded-md p-3">
              <h3 className="text-sm font-semibold mb-2">Current Event</h3>
              {currentEvent ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="capitalize">
                      {currentEvent.type.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center text-xs text-text-tertiary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(currentEvent.timestamp, 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-semibold">Event Data:</span>
                      <pre className="mt-1 p-2 bg-midnight-elevated rounded-md overflow-x-auto">
                        {JSON.stringify(currentEvent.data, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      {currentEvent.completed ? (
                        <Badge variant="success">Processed</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold">Triggered Achievements:</span>
                      {currentEvent.completed && currentEvent.triggeredAchievements.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentEvent.triggeredAchievements.map(achievement => (
                            <Badge key={achievement.id} className="bg-arcane-15 text-arcane border-arcane-30">
                              {achievement.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-text-tertiary mt-1">
                          {currentEvent.completed ? 'No achievements triggered' : 'Not processed yet'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-text-tertiary">
                  No current event
                </div>
              )}
            </div>
            
            {/* Event timeline */}
            <ScrollArea className="h-[200px] border border-divider/30 rounded-md">
              <div className="p-2 space-y-2">
                {events.map((event, index) => (
                  <div 
                    key={event.id}
                    className={`p-2 border rounded-md text-xs ${
                      index === currentIndex 
                        ? 'border-arcane bg-arcane-15' 
                        : event.completed 
                          ? 'border-success bg-success/5' 
                          : 'border-divider/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="capitalize">
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-text-tertiary">
                        {format(event.timestamp, 'MMM d')}
                      </span>
                    </div>
                    <div className="mt-1 text-text-secondary">
                      {event.completed ? (
                        event.triggeredAchievements.length > 0 ? (
                          <span>Triggered {event.triggeredAchievements.length} achievement(s)</span>
                        ) : (
                          <span>Processed - no achievements</span>
                        )
                      ) : (
                        <span>Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StepByStepSimulation;
