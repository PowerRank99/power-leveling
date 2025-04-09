
import React from 'react';
import { Clock, Dumbbell, MoreVertical } from 'lucide-react';
import SwipeableRow from './set/SwipeableRow';
import DeleteButton from './set/DeleteButton';
import { cn } from '@/lib/utils';

interface RoutineCardProps {
  id: string;
  name: string;
  exercisesCount?: number;
  lastUsed?: string | null;
  isDeleting?: boolean;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({
  id,
  name,
  exercisesCount = 0,
  lastUsed,
  isDeleting = false,
  onDelete,
  onClick
}) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };
  
  const formatLastUsed = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nunca usado';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return `${diffDays} dias atrás`;
  };
  
  return (
    <SwipeableRow
      swipeEnabled={Boolean(onDelete) && !isDeleting}
      onSwipeTrigger={handleDelete}
      renderSwipeAction={({ offsetX, swiping, onClick: onDeleteClick }) => (
        <DeleteButton 
          offsetX={offsetX} 
          swiping={swiping} 
          onClick={onDeleteClick} 
        />
      )}
    >
      <div 
        className={cn(
          "bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 transition-all duration-200 relative",
          isDeleting ? "opacity-50" : "hover:shadow-md",
          onClick ? "cursor-pointer" : ""
        )}
        onClick={onClick}
      >
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <p>{formatLastUsed(lastUsed)}</p>
            </div>
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-100">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs w-fit">
            <Dumbbell className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium">{exercisesCount}</span>
            <span className="ml-1">exercícios</span>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-lg"></div>
      </div>
    </SwipeableRow>
  );
};

export default RoutineCard;
