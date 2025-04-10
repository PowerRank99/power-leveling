
import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const WorkoutLoading = () => {
  return (
    <div className="min-h-screen bg-midnight-deep flex items-center justify-center">
      <LoadingSpinner 
        size="lg" 
        message="Preparando seu treino..." 
        subMessage="Carregando exercícios e configurações"
      />
    </div>
  );
};

export default WorkoutLoading;
