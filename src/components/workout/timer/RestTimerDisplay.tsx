
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerDisplayProps {
  durationSeconds: number;
  exerciseId: string;
  exerciseName: string;
  onTimerClick: () => void;
  onStartTimer: (exerciseId: string, exerciseName: string) => void;
}

const RestTimerDisplay: React.FC<RestTimerDisplayProps> = ({
  durationSeconds,
  exerciseId,
  exerciseName,
  onTimerClick,
  onStartTimer
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
      onClick={onTimerClick}
      title="Alterar tempo de descanso"
    >
      <Clock className="w-4 h-4" />
      <span className="text-xs">
        {formatDuration(durationSeconds)}
      </span>
    </Button>
  );
};

export default RestTimerDisplay;
