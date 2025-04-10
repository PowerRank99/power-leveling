
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Sparkles } from 'lucide-react';

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
      className={`w-full py-6 text-lg font-display tracking-wide relative overflow-hidden
        ${userClass === selectedClass 
          ? 'bg-arcane-400 hover:bg-arcane-300' 
          : 'bg-gradient-arcane-valor hover:shadow-glow'}`}
    >
      {isSelecting ? (
        <>
          <LoadingSpinner size="sm" className="mr-2 py-0" /> 
          <span>Selecionando...</span>
        </>
      ) : userClass === selectedClass ? (
        <>
          <span>Manter Classe Atual</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2 text-xpgold animate-pulse" />
          <span>Confirmar Seleção</span>
        </>
      )}
      <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] animate-shimmer opacity-20"></div>
    </Button>
  );
};

export default ClassSelectButton;
