
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ClassSelectButtonProps {
  selectedClass: string | null;
  userClass: string | null;
  isSelecting: boolean;
  isOnCooldown: boolean;
  onClick: () => void;
}

const ClassSelectButton: React.FC<ClassSelectButtonProps> = ({
  selectedClass,
  userClass,
  isSelecting,
  isOnCooldown,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={!selectedClass || isSelecting || (isOnCooldown && selectedClass !== userClass)}
      className="w-full py-6 text-lg"
    >
      {isSelecting ? (
        <>
          <LoadingSpinner size="sm" className="mr-2 py-0" /> 
          Selecionando...
        </>
      ) : userClass === selectedClass ? (
        'Manter Classe Atual'
      ) : (
        'Confirmar Seleção'
      )}
    </Button>
  );
};

export default ClassSelectButton;
