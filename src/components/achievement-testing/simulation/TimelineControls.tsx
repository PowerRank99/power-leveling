
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, SkipBack, SkipForward, 
  FastForward, Rewind 
} from 'lucide-react';

interface TimelineControlsProps {
  isPlaying: boolean;
  currentPosition: number;
  maxPosition: number;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onSpeedChange: (speed: number) => void;
  onPositionChange: (position: number) => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  currentPosition,
  maxPosition,
  playbackSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onSpeedChange,
  onPositionChange
}) => {
  const speeds = [0.5, 1, 2, 5, 10];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onStepBack}
            disabled={isPlaying || currentPosition <= 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          {isPlaying ? (
            <Button variant="outline" size="icon" onClick={onPause}>
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={onPlay}
              disabled={currentPosition >= maxPosition}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={onStepForward}
            disabled={isPlaying || currentPosition >= maxPosition}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-text-secondary">Speed:</span>
          {speeds.map(speed => (
            <Button
              key={speed}
              variant={playbackSpeed === speed ? "default" : "outline"}
              size="sm"
              className={`h-7 w-7 p-0 ${playbackSpeed === speed ? 'bg-arcane text-white' : ''}`}
              onClick={() => onSpeedChange(speed)}
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <Slider
          value={[currentPosition]}
          min={0}
          max={maxPosition}
          step={1}
          onValueChange={([value]) => onPositionChange(value)}
          disabled={isPlaying}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>Start</span>
          <span>Event {currentPosition + 1} of {maxPosition + 1}</span>
          <span>End</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineControls;
