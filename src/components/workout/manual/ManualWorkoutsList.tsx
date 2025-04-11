
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ManualWorkout } from '@/types/manualWorkoutTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityIcon, CalendarIcon, ZapIcon } from 'lucide-react';
import { getActivityLabel } from '@/utils/workoutActivityUtils';

interface ManualWorkoutsListProps {
  workouts: ManualWorkout[];
  isLoading: boolean;
}

const ManualWorkoutsList: React.FC<ManualWorkoutsListProps> = ({ workouts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-arcane/30 border-t-arcane rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (workouts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-secondary">Nenhum treino manual registrado ainda.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <Card key={workout.id} className="p-4 bg-midnight-elevated border-arcane/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-md overflow-hidden">
                <img 
                  src={workout.photoUrl} 
                  alt="Workout" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-secondary">
                    {formatDistanceToNow(new Date(workout.workoutDate), { 
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Badge variant="secondary" className="bg-arcane/10 text-arcane">
                    <ZapIcon className="h-3 w-3 mr-1" />
                    {workout.xpAwarded} XP
                  </Badge>
                  
                  {workout.isPowerDay && (
                    <Badge variant="secondary" className="ml-2 bg-achievement-gold/10 text-achievement-gold">
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
      ))}
    </div>
  );
};

export default ManualWorkoutsList;
