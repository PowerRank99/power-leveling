
import React from 'react';
import { Button } from '@/components/ui/button';

interface FinishWorkoutButtonProps {
  onFinish: () => void;
  isFinishing: boolean;
}

const FinishWorkoutButton: React.FC<FinishWorkoutButtonProps> = ({ onFinish, isFinishing }) => {
  return (
    <div className="p-4">
      <Button 
        className="w-full bg-fitblue"
        onClick={onFinish}
        disabled={isFinishing}
      >
        {isFinishing ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Finalizando...
          </>
        ) : (
          "Finalizar Treino"
        )}
      </Button>
    </div>
  );
};

export default FinishWorkoutButton;
