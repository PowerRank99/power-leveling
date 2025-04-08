
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FinishWorkoutButtonProps {
  onFinish: () => void;
  isFinishing: boolean;
}

const FinishWorkoutButton: React.FC<FinishWorkoutButtonProps> = ({ onFinish, isFinishing }) => {
  return (
    <Button 
      className="w-full py-6 text-white bg-blue-500 hover:bg-blue-600 rounded-lg font-medium text-lg"
      onClick={onFinish}
      disabled={isFinishing}
    >
      {isFinishing ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          <span>Finalizando...</span>
        </div>
      ) : (
        "Finalizar Treino"
      )}
    </Button>
  );
};

export default FinishWorkoutButton;
