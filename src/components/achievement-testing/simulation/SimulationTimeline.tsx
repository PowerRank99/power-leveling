import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
  Clock,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { useAchievementSimulation } from '@/hooks/useAchievementSimulation';
import { format } from 'date-fns';
import TimelineControls from './TimelineControls';

interface SimulationTimelineProps {
  userId: string;
}

const SimulationTimeline: React.FC<SimulationTimelineProps> = ({ userId }) => {
  const {
    timeline,
    startPlayback,
    pausePlayback,
    setPlaybackSpeed,
    stepForward,
    stepBackward,
    resetTimeline,
    createScenario,
    currentEvent,
    seekToPosition
  } = useAchievementSimulation(userId);

  return (
    <Card className="border-arcane-30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Clock className="mr-2 h-5 w-5 text-arcane" />
          Achievement Timeline Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => createScenario('new_user')}
              disabled={timeline.isPlaying}
            >
              New User Journey
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createScenario('streak_master')}
              disabled={timeline.isPlaying}
            >
              Streak Master
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createScenario('pr_journey')}
              disabled={timeline.isPlaying}
            >
              PR Journey
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTimeline}
            disabled={timeline.isPlaying || timeline.events.length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {timeline.events.length > 0 ? (
          <>
            <TimelineControls
              isPlaying={timeline.isPlaying}
              currentPosition={timeline.currentPosition}
              maxPosition={timeline.events.length - 1}
              playbackSpeed={timeline.playbackSpeed}
              onPlay={startPlayback}
              onPause={pausePlayback}
              onStepForward={stepForward}
              onStepBack={stepBackward}
              onSpeedChange={setPlaybackSpeed}
              onPositionChange={(pos) => seekToPosition(pos)}
            />

            <div className="border border-divider/30 rounded-md p-3">
              <h3 className="text-sm font-semibold mb-2">Current Event</h3>
              {currentEvent ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="capitalize">
                      {currentEvent.type}
                    </Badge>
                    <div className="flex items-center text-xs text-text-tertiary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {currentEvent.timestamp ? format(new Date(currentEvent.timestamp), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
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
                      <span className="font-semibold">Triggered Achievements:</span>
                      {currentEvent.triggeredAchievements.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentEvent.triggeredAchievements.map(achievement => (
                            <Badge key={achievement.id} className="bg-arcane-15 text-arcane border-arcane-30">
                              {achievement.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-text-tertiary mt-1">No achievements triggered</div>
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

            <ScrollArea className="h-[200px] border border-divider/30 rounded-md">
              <div className="p-2 space-y-2">
                {timeline.events.map((event, index) => (
                  <div 
                    key={index}
                    className={`p-2 border rounded-md text-xs ${
                      index === timeline.currentPosition 
                        ? 'border-arcane bg-arcane-15' 
                        : 'border-divider/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                      <span className="text-text-tertiary">
                        Event {index + 1}
                      </span>
                    </div>
                    <div className="mt-1 text-text-secondary">
                      {event.triggeredAchievements.length > 0 ? (
                        <span>Triggers {event.triggeredAchievements.length} achievement(s)</span>
                      ) : (
                        <span>No achievements triggered</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-8 text-text-tertiary">
            <p>No timeline events</p>
            <p className="mt-2 text-sm">
              Select a scenario template or create custom events to start
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimulationTimeline;
