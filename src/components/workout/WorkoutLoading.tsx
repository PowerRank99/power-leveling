
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import WorkoutSkeleton from '@/components/workout/WorkoutSkeleton';

const WorkoutLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Treino Atual" />
      
      <div className="bg-white p-2">
        <div className="flex justify-between items-center px-2">
          <div className="text-sm text-gray-500">
            Carregando exercícios...
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner 
          message="Carregando treino..." 
          subMessage="Preparando seus exercícios" 
        />
      </div>
      
      <WorkoutSkeleton />
    </div>
  );
};

export default WorkoutLoading;
