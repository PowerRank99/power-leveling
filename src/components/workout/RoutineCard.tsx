
import React from 'react';
import { Calendar, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatters';
import SwipeableRow from './set/SwipeableRow';
import DeleteButton from './set/DeleteButton';

interface RoutineCardProps {
  id: string;
  name: string;
  exercisesCount: number;
  lastUsedDate?: string | null;
  isDeleting?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({
  id,
  name,
  exercisesCount,
  lastUsedDate,
  isDeleting = false,
  onEdit,
  onDelete,
  onSelect
}) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };
  
  const handleSelect = () => {
    if (onSelect) {
      onSelect(id);
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
      <div 
        className={`bg-midnight-elevated p-4 mb-4 border border-divider rounded-lg shadow-subtle hover:shadow-elevated transition-all ${isDeleting ? 'opacity-50' : ''}`}
        onClick={handleSelect}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-orbitron font-bold text-lg text-text-primary">{name}</h3>
            <div className="text-text-secondary text-sm mt-1 flex items-center font-sora">
              <span className="mr-4">{exercisesCount} exercícios</span>
              
              {lastUsedDate && (
                <span className="flex items-center text-xs">
                  <Calendar className="h-3 w-3 mr-1 text-arcane" /> 
                  Usado {formatDate(lastUsedDate)}
                </span>
              )}
            </div>
          </div>
          
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              className="h-8 w-8 text-text-tertiary hover:text-arcane hover:bg-arcane-15 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </SwipeableRow>
  );
};

export default RoutineCard;
