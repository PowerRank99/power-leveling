
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinishWorkoutButtonProps {
  onFinish: () => void;
  isFinishing: boolean;
}

const FinishWorkoutButton: React.FC<FinishWorkoutButtonProps> = ({ onFinish, isFinishing }) => {
  return (
    <div>
      <Button 
        className="w-full py-4 rounded-md flex items-center justify-center gap-2"
        onClick={onFinish}
        disabled={isFinishing}
      >
        {isFinishing ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Finalizando...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Finalizar Treino
          </>
        )}
      </Button>
    </div>
  );
};

export default FinishWorkoutButton;
