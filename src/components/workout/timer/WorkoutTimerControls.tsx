import React from 'react';
import { Button } from '@/components/ui/button';
import { TimerState } from '@/hooks/timer/timerTypes';

interface WorkoutTimerControlsProps {
  timerState: TimerState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddTime: (seconds: number) => void;
}

const WorkoutTimerControls: React.FC<WorkoutTimerControlsProps> = ({
  timerState,
  onPause,
  onResume,
  onStop,
  onAddTime
}) => {
  if (!timerState.isActive) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddTime(30)}
        className="px-3"
      >
        +30s
      </Button>
      
      {timerState.isPaused ? (
        <Button
          variant="default"
          size="sm"
          onClick={onResume}
          className="px-4"
        >
          Resume
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onPause}
          className="px-4"
        >
          Pause
        </Button>
      )}
      
      <Button
        variant="destructive"
        size="sm"
        onClick={onStop}
        className="px-3"
      >
        Stop
      </Button>
    </div>
  );
};

export default WorkoutTimerControls;
