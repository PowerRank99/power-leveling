
import React from 'react';
import { UnifiedWorkout } from '@/types/unifiedWorkoutTypes';
import WorkoutCard from './WorkoutCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityIcon, CalendarIcon, ZapIcon, ClipboardCheck, Pencil } from 'lucide-react';
import { getActivityLabel } from '@/utils/workoutActivityUtils';
import SwipeableRow from './set/SwipeableRow';
import DeleteButton from './set/DeleteButton';
import WorkoutContextMenu from './WorkoutContextMenu';

interface UnifiedWorkoutItemProps {
  workout: UnifiedWorkout;
  onDelete?: (id: string) => void;
  isDeletingItem: (id: string) => boolean;
}

const UnifiedWorkoutItem: React.FC<UnifiedWorkoutItemProps> = ({ 
  workout, 
  onDelete,
  isDeletingItem
}) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(workout.id);
    }
  };

  const isDeleting = isDeletingItem(workout.id);
  
  if (workout.type === 'tracked') {
    return (
      <WorkoutContextMenu
        workoutId={workout.id}
        workoutName={workout.name}
        onDeleteWorkout={onDelete}
      >
        <WorkoutCard 
          id={workout.id}
          name={workout.name}
          date={workout.date}
          exercisesCount={workout.exercisesCount}
          setsCount={workout.setsCount}
          prs={workout.prs}
          durationSeconds={workout.durationSeconds}
          isDeleting={isDeleting}
          onDelete={onDelete}
          workoutType="tracked"
        />
      </WorkoutContextMenu>
    );
  } else {
    // Manual workout
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
        <Card className={`p-4 bg-midnight-elevated border-valor-30/30 mb-4 ${isDeleting ? 'opacity-50' : ''}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-secondary">{workout.date}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-valor-15 text-valor border-valor-30 flex items-center gap-1">
                    <Pencil className="h-3 w-3" />
                    Manual
                  </Badge>
                  
                  <Badge variant="secondary" className="bg-arcane/10 text-arcane">
                    <ZapIcon className="h-3 w-3 mr-1" />
                    {workout.xpAwarded} XP
                  </Badge>
                  
                  {workout.isPowerDay && (
                    <Badge variant="secondary" className="bg-achievement-gold/10 text-achievement-gold">
                      Power Day
                    </Badge>
                  )}
                </div>
              </div>
              
              {workout.activityType && (
                <div className="flex items-center mt-2">
                  <ActivityIcon className="h-4 w-4 text-text-tertiary mr-2" />
                  <span className="text-sm text-text-primary">
                    {getActivityLabel(workout.activityType)}
                  </span>
                </div>
              )}
              
              {workout.description && (
                <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                  {workout.description}
                </p>
              )}
            </div>
          </div>
        </Card>
      </SwipeableRow>
    );
  }
};

export default UnifiedWorkoutItem;
