
import React from 'react';
import { Clock } from 'lucide-react';

interface RestTimerDisplayProps {
  durationSeconds: number;
  exerciseId: string;
  exerciseName: string;
  onTimerClick: () => void;
  onStartTimer: (exerciseId: string, exerciseName: string) => void;
  isSaving: boolean;
}

const RestTimerDisplay: React.FC<RestTimerDisplayProps> = ({
  durationSeconds,
  exerciseId,
  exerciseName,
  onTimerClick,
  onStartTimer,
  isSaving
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleClick = () => {
    onTimerClick();
  };
  
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartTimer(exerciseId, exerciseName);
  };
  
  return (
    <div 
      className="flex flex-col items-end cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center mb-1 text-text-secondary">
        <Clock className="w-4 h-4 mr-1 text-arcane-60" />
        <span className="text-sm font-medium font-sora">Descanso</span>
        {isSaving && <span className="text-xs ml-2 text-text-tertiary animate-pulse">Salvando...</span>}
      </div>
      <div className="flex gap-2">
        <button 
          className="px-2 py-1 text-sm bg-midnight-elevated hover:bg-arcane-15 border border-divider rounded-md text-text-primary transition-colors font-space shadow-subtle"
          onClick={handleStart}
        >
          {formatDuration(durationSeconds)}
        </button>
      </div>
    </div>
  );
};

export default RestTimerDisplay;
