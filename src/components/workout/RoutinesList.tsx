
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RoutineCard from '@/components/workout/RoutineCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Routine } from '@/hooks/useWorkoutData';

interface RoutinesListProps {
  routines: Routine[];
  isLoading: boolean;
}

const RoutinesList: React.FC<RoutinesListProps> = ({ routines, isLoading }) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return <LoadingSpinner message="Carregando suas rotinas..." />;
  }
  
  if (routines.length === 0) {
    return (
      <EmptyState 
        message="Você ainda não tem rotinas salvas" 
        action={
          <Button 
            onClick={() => navigate('/criar-rotina')}
            className="bg-fitblue text-white rounded-lg px-4 py-2 font-medium"
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
        <RoutineCard 
          key={routine.id}
          id={routine.id}
          name={routine.name}
          exercisesCount={routine.exercises_count || 0}
          lastUsedAt={routine.last_used_at}
        />
      ))}
    </>
  );
};

export default RoutinesList;
