
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface FinishWorkoutButtonProps {
  onFinish: () => void;
  isFinishing: boolean;
}

const FinishWorkoutButton: React.FC<FinishWorkoutButtonProps> = ({ onFinish, isFinishing }) => {
  return (
    <Button 
      className="w-full py-6 bg-arcane hover:bg-arcane-60 text-text-primary rounded-lg font-medium text-lg font-sora shadow-glow-subtle"
      onClick={onFinish}
      disabled={isFinishing}
    >
      {isFinishing ? (
        <>
          <div className="animate-spin h-5 w-5 border-2 border-text-primary border-t-transparent rounded-full mr-2"></div>
          Finalizando...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Finalizar Treino
        </>
      )}
    </Button>
  );
};

export default FinishWorkoutButton;
