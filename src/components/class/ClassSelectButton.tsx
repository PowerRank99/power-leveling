
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

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
      'Ninja': 'from-emerald-600 to-emerald-500',
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
  
  // Button animations
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.97 }
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
      ) : (
        <ArrowRight className="mr-2 w-5 h-5" />
      )}
      {getButtonText()}
    </>
  );
  
  return (
    <div className="w-full mt-8">
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileHover={(!selectedClass || isSelecting || (isOnCooldown && selectedClass !== userClass)) ? "initial" : "hover"}
        whileTap={(!selectedClass || isSelecting || (isOnCooldown && selectedClass !== userClass)) ? "initial" : "tap"}
        className="w-full"
      >
        <Button
          onClick={onClick}
          disabled={!selectedClass || isSelecting || (isOnCooldown && selectedClass !== userClass)}
          className={`w-full py-7 text-lg font-bold bg-gradient-to-r ${getClassGradient(selectedClass)} shadow-lg border border-white/20 rounded-xl`}
        >
          {buttonContent}
        </Button>
      </motion.div>
      
      {/* Current selection indicator */}
      {selectedClass && (
        <motion.div 
          className="mt-3 text-center text-sm text-white/80"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Classe selecionada: <span className="font-medium text-white">{selectedClass}</span>
        </motion.div>
      )}
    </div>
  );
};

export default ClassSelectButton;
