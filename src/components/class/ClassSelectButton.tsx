
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ClassService } from '@/services/rpg/ClassService';

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
  // Get gradient color based on selected class
  const getClassGradient = (className: string | null) => {
    if (!className) return 'from-arcane to-arcane-60';
    
    // Map class names to gradient colors
    const gradientMap: Record<string, string> = {
      'Guerreiro': 'from-red-600 to-red-500',
      'Monge': 'from-amber-600 to-amber-500',
      'Ninja': 'from-green-600 to-green-500',
      'Bruxo': 'from-purple-600 to-purple-500',
      'Paladino': 'from-blue-600 to-blue-500'
    };
    
    return gradientMap[className] || 'from-arcane to-arcane-60';
  };
  
  // Define button text based on state
  const getButtonText = () => {
    if (isSelecting) return 'Selecionando...';
    if (userClass === selectedClass) return 'Manter Classe Atual';
    return 'Confirmar Seleção';
  };
  
  // Define button content with gradient or spinner
  const buttonContent = isSelecting ? (
    <>
      <LoadingSpinner size="sm" className="mr-2" /> 
      Selecionando...
    </>
  ) : (
    <>
      {userClass === selectedClass ? (
        <Check className="mr-2 w-5 h-5" />
      ) : null}
      {getButtonText()}
    </>
  );
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Button
        onClick={onClick}
        disabled={!selectedClass || isSelecting || (isOnCooldown && selectedClass !== userClass)}
        className={`w-full py-6 text-lg bg-gradient-to-r ${getClassGradient(selectedClass)} shadow-lg`}
      >
        {buttonContent}
      </Button>
      
      {/* Current selection indicator */}
      {selectedClass && (
        <div className="mt-3 text-center text-sm text-text-secondary">
          Classe selecionada: <span className="font-medium text-arcane">{selectedClass}</span>
        </div>
      )}
    </motion.div>
  );
};

export default ClassSelectButton;
