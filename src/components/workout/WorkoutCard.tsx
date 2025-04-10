
import React from 'react';
import { formatDuration } from '@/utils/formatters';
import SwipeableRow from './set/SwipeableRow';
import DeleteButton from './set/DeleteButton';

interface WorkoutCardProps {
  id: string;
  name: string;
  date: string;
  exercisesCount: number;
  setsCount: number;
  prs?: number;
  durationSeconds?: number | null;
  isDeleting?: boolean;
  onDelete?: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  id,
  name,
  date,
  exercisesCount,
  setsCount,
  prs = 0,
  durationSeconds,
  isDeleting = false,
  onDelete
}) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };
  
  return (
    <SwipeableRow
      swipeEnabled={Boolean(onDelete) && !isDeleting}
      onSwipeTrigger={handleDelete}
      renderSwipeAction={({ offsetX, swiping, onClick }) => (
        <DeleteButton 
          offsetX={offsetX} 
          swiping={swiping} 
          onClick={onClick} 
        />
      )}
    >
      <div className={`bg-midnight-elevated rounded-lg shadow-subtle p-4 mb-4 border border-divider ${isDeleting ? 'opacity-50' : ''}`}>
        <div className="flex justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-lg text-text-primary">{name}</h3>
            <p className="text-text-secondary text-sm font-sora">{date}</p>
          </div>
          <div className="text-achievement font-bold font-space">+{exercisesCount * 10} XP</div>
        </div>
        
        <div className="flex mt-3 space-x-2">
          <div className="bg-midnight-card rounded-lg px-3 py-1 text-sm text-text-secondary border border-divider/30">
            <span className="font-medium">{exercisesCount}</span> exercícios
          </div>
          <div className="bg-midnight-card rounded-lg px-3 py-1 text-sm text-text-secondary border border-divider/30">
            <span className="font-medium">{setsCount}</span> séries
          </div>
          {prs > 0 && (
            <div className="bg-arcane-15 text-arcane rounded-lg px-3 py-1 text-sm border border-arcane-30">
              <span className="font-medium">{prs}</span> PRs
            </div>
          )}
          {durationSeconds && (
            <div className="bg-valor-15 text-valor rounded-lg px-3 py-1 text-sm border border-valor-30">
              {formatDuration(durationSeconds)}
            </div>
          )}
        </div>
      </div>
    </SwipeableRow>
  );
};

export default WorkoutCard;
