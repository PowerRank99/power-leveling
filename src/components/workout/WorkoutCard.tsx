
import React from 'react';
import { formatDuration } from '@/utils/formatters';

interface WorkoutCardProps {
  id: string;
  name: string;
  date: string;
  exercisesCount: number;
  setsCount: number;
  prs?: number;
  durationSeconds?: number | null;
  isDeleting?: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  id,
  name,
  date,
  exercisesCount,
  setsCount,
  prs = 0,
  durationSeconds,
  isDeleting = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-gray-500 text-sm">{date}</p>
        </div>
        <div className="text-fitgreen font-bold">+{exercisesCount * 10} XP</div>
      </div>
      
      <div className="flex mt-3 space-x-2">
        <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
          <span className="font-medium">{exercisesCount}</span> exercícios
        </div>
        <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
          <span className="font-medium">{setsCount}</span> séries
        </div>
        {prs > 0 && (
          <div className="bg-fitblue-100 text-fitblue-700 rounded-lg px-3 py-1 text-sm">
            <span className="font-medium">{prs}</span> PRs
          </div>
        )}
        {durationSeconds && (
          <div className="bg-fitblue-50 text-fitblue-700 rounded-lg px-3 py-1 text-sm">
            {formatDuration(durationSeconds)}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutCard;
