
import React from 'react';
import { formatDuration } from '@/utils/formatters';
import SwipeableRow from './set/SwipeableRow';
import DeleteButton from './set/DeleteButton';
import { Calendar, Dumbbell, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className={cn(
        "bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 transition-all duration-200 hover:shadow-md",
        isDeleting ? "opacity-50" : "",
      )}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <p>{date}</p>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-full text-sm font-medium">
            +{exercisesCount * 10} XP
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div className="flex space-x-1">
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs">
              <Dumbbell className="w-3.5 h-3.5 mr-1 text-gray-500" />
              <span className="font-medium">{exercisesCount}</span>
              <span className="text-gray-500 ml-1">exercícios</span>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs">
              <span className="font-medium">{setsCount}</span>
              <span className="text-gray-500 ml-1">séries</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {prs > 0 && (
              <div className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">
                {prs} PRs
              </div>
            )}
            
            {durationSeconds && (
              <div className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {formatDuration(durationSeconds)}
              </div>
            )}
          </div>
        </div>
      </div>
    </SwipeableRow>
  );
};

export default WorkoutCard;
