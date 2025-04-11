
import React from 'react';
import { RoutineWithExercises } from '@/components/workout/types/Workout';
import RoutinesList from '@/components/workout/RoutinesList';

interface RoutinesSectionProps {
  routines: RoutineWithExercises[];
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
  hasAttemptedLoad: boolean;
  onDeleteRoutine: (id: string) => Promise<void>;
  isDeletingItem: Record<string, boolean>;
}

const RoutinesSection: React.FC<RoutinesSectionProps> = ({
  routines,
  isLoading,
  onRetry,
  error,
  hasAttemptedLoad,
  onDeleteRoutine,
  isDeletingItem
}) => {
  return (
    <div className="premium-card p-4 shadow-subtle">
      <h2 className="text-xl font-orbitron font-bold mb-4 text-text-primary">Rotinas Salvas</h2>
      <RoutinesList 
        routines={routines} 
        isLoading={isLoading} 
        onRetry={onRetry}
        error={error}
        hasAttemptedLoad={hasAttemptedLoad}
        onDeleteRoutine={onDeleteRoutine}
        isDeletingItem={isDeletingItem}
      />
    </div>
  );
};

export default RoutinesSection;
