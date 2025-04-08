
import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerDisplayProps {
  durationSeconds: number;
  exerciseId: string;
  exerciseName: string;
  onTimerClick: () => void;
  onStartTimer: (exerciseId: string, exerciseName: string) => void;
  isSaving?: boolean;
}

const RestTimerDisplay: React.FC<RestTimerDisplayProps> = ({
  durationSeconds,
  exerciseId,
  exerciseName,
  onTimerClick,
  onStartTimer,
  isSaving = false
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
      disabled={isSaving}
    >
      {isSaving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span className="text-xs">
        {formatDuration(durationSeconds)}
      </span>
    </Button>
  );
};

export default RestTimerDisplay;
