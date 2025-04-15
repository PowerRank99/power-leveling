
import { useState, useEffect } from 'react';
import { Achievement } from '@/types/achievementTypes';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';

interface SimulationEvent {
  type: 'workout' | 'manual_workout' | 'personal_record' | 'streak' | 'level_up' | 'guild_action';
  data: any;
  timestamp: Date;
  triggeredAchievements: Achievement[];
}

interface SimulationTimelineState {
  events: SimulationEvent[];
  isPlaying: boolean;
  playbackSpeed: number;
  currentPosition: number;
}

export function useAchievementSimulation(userId: string) {
  const { simulateAchievement, allAchievements } = useTestingDashboard();
  const [timeline, setTimeline] = useState<SimulationTimelineState>({
    events: [],
    isPlaying: false,
    playbackSpeed: 1,
    currentPosition: 0
  });
  
  // Add a new event to the timeline
  const addEvent = (event: Omit<SimulationEvent, 'timestamp' | 'triggeredAchievements'>) => {
    setTimeline(prev => ({
      ...prev,
      events: [...prev.events, {
        ...event,
        timestamp: new Date(),
        triggeredAchievements: []
      }]
    }));
  };
  
  // Start the simulation playback
  const startPlayback = () => {
    setTimeline(prev => ({ ...prev, isPlaying: true }));
  };
  
  // Pause the simulation playback
  const pausePlayback = () => {
    setTimeline(prev => ({ ...prev, isPlaying: false }));
  };
  
  // Set the playback speed (0.5, 1, 2, 5, etc.)
  const setPlaybackSpeed = (speed: number) => {
    setTimeline(prev => ({ ...prev, playbackSpeed: speed }));
  };
  
  // Move to a specific position in the timeline
  const seekToPosition = (position: number) => {
    setTimeline(prev => ({ ...prev, currentPosition: position }));
  };
  
  // Step forward one event
  const stepForward = () => {
    if (timeline.currentPosition < timeline.events.length - 1) {
      setTimeline(prev => ({ ...prev, currentPosition: prev.currentPosition + 1 }));
      
      // Trigger the achievement simulation for this event
      const event = timeline.events[timeline.currentPosition + 1];
      if (event.triggeredAchievements.length > 0) {
        event.triggeredAchievements.forEach(achievement => {
          simulateAchievement(achievement.id);
        });
      }
    }
  };
  
  // Step backward one event
  const stepBackward = () => {
    if (timeline.currentPosition > 0) {
      setTimeline(prev => ({ ...prev, currentPosition: prev.currentPosition - 1 }));
    }
  };
  
  // Reset the timeline
  const resetTimeline = () => {
    setTimeline({
      events: [],
      isPlaying: false,
      playbackSpeed: 1,
      currentPosition: 0
    });
  };
  
  // Create a template-based scenario with predefined events
  const createScenario = (scenarioType: 'new_user' | 'streak_master' | 'pr_journey' | 'guild_master') => {
    let events: Omit<SimulationEvent, 'timestamp' | 'triggeredAchievements'>[] = [];
    
    switch (scenarioType) {
      case 'new_user':
        // First week of a new user
        for (let i = 0; i < 5; i++) {
          events.push({
            type: 'workout',
            data: { duration: 45 + Math.floor(Math.random() * 30), exercise_count: 3 + Math.floor(Math.random() * 4) }
          });
        }
        break;
      
      case 'streak_master':
        // 30 days of consistency
        for (let i = 0; i < 30; i++) {
          events.push({
            type: 'workout',
            data: { duration: 45 + Math.floor(Math.random() * 60), exercise_count: 4 + Math.floor(Math.random() * 5) }
          });
        }
        break;
      
      case 'pr_journey':
        // Setting 10 PRs over time
        for (let i = 0; i < 10; i++) {
          events.push({
            type: 'personal_record',
            data: { exercise_id: `exercise-${i}`, weight: 50 + (i * 5) }
          });
        }
        break;
      
      case 'guild_master':
        // Guild creation and growth
        events.push({ type: 'guild_action', data: { action: 'create_guild', name: 'Test Guild' } });
        for (let i = 0; i < 5; i++) {
          events.push({ type: 'guild_action', data: { action: 'add_member', user_id: `user-${i}` } });
        }
        break;
    }
    
    setTimeline({
      events: events.map(event => ({
        ...event,
        timestamp: new Date(),
        triggeredAchievements: allAchievements.filter(a => 
          Math.random() > 0.7 && // Randomly select achievements for this demo
          a.category.toLowerCase().includes(event.type)
        )
      })),
      isPlaying: false,
      playbackSpeed: 1,
      currentPosition: 0
    });
  };
  
  useEffect(() => {
    let playbackInterval: NodeJS.Timeout | null = null;
    
    if (timeline.isPlaying) {
      playbackInterval = setInterval(() => {
        setTimeline(prev => {
          if (prev.currentPosition >= prev.events.length - 1) {
            clearInterval(playbackInterval!);
            return { ...prev, isPlaying: false };
          }
          
          const newPosition = prev.currentPosition + 1;
          
          // Trigger achievement simulation for this event
          const event = prev.events[newPosition];
          if (event.triggeredAchievements.length > 0) {
            event.triggeredAchievements.forEach(achievement => {
              simulateAchievement(achievement.id);
            });
          }
          
          return { ...prev, currentPosition: newPosition };
        });
      }, 1000 / timeline.playbackSpeed);
    }
    
    return () => {
      if (playbackInterval) clearInterval(playbackInterval);
    };
  }, [timeline.isPlaying, timeline.playbackSpeed, simulateAchievement]);
  
  return {
    timeline,
    addEvent,
    startPlayback,
    pausePlayback,
    setPlaybackSpeed,
    seekToPosition,
    stepForward,
    stepBackward,
    resetTimeline,
    createScenario,
    currentEvent: timeline.events[timeline.currentPosition]
  };
}
