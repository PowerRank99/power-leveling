
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RoutineCard from '@/components/workout/RoutineCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Routine } from '@/hooks/useWorkoutData';
import { RefreshCw } from 'lucide-react';
import RoutineContextMenu from '@/components/workout/RoutineContextMenu';

interface RoutinesListProps {
  routines: Routine[];
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
  hasAttemptedLoad: boolean;
  onDeleteRoutine: (routineId: string) => void;
  isDeletingItem: (id: string) => boolean;
}

const RoutinesList: React.FC<RoutinesListProps> = ({ 
  routines, 
  isLoading, 
  onRetry,
  error,
  hasAttemptedLoad,
  onDeleteRoutine,
  isDeletingItem
}) => {
  const navigate = useNavigate();
  
  if (isLoading && !hasAttemptedLoad) {
    return <LoadingSpinner message="Carregando suas rotinas..." />;
  }
  
  if (error) {
    return (
      <EmptyState 
        message="Não foi possível carregar suas rotinas" 
        action={
          <Button 
            onClick={onRetry}
            variant="outline"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        }
      />
    );
  }
  
  if (routines.length === 0) {
    return (
      <EmptyState 
        message="Você ainda não tem rotinas salvas" 
        action={
          <Button 
            onClick={() => navigate('/treino/criar')}
            className="bg-fitblue text-white rounded-lg px-4 py-2 font-medium mt-2"
          >
            Criar Primeira Rotina
          </Button>
        }
      />
    );
  }
  
  return (
    <>
      {routines.map(routine => (
        <RoutineContextMenu
          key={routine.id}
          routineId={routine.id}
          routineName={routine.name}
          onDeleteRoutine={onDeleteRoutine}
        >
          <RoutineCard 
            id={routine.id}
            name={routine.name}
            exercisesCount={routine.exercises_count || 0}
            lastUsedAt={routine.last_used_at}
            isDeleting={isDeletingItem(routine.id)}
            onDelete={onDeleteRoutine}
          />
        </RoutineContextMenu>
      ))}
    </>
  );
};

export default RoutinesList;
