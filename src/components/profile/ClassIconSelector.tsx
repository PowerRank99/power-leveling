import React from 'react';
import { Sword, Wind, Sparkles, Shield, Dumbbell, Leaf, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClassIconSelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const ClassIconSelector: React.FC<ClassIconSelectorProps> = ({ 
  className, 
  size = 'md',
  animate = false
}) => {
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-10 h-10';
      case 'md':
      default: return 'w-6 h-6';
    }
  };
  
  const getColor = () => {
    if (!className) return 'text-gray-400';
    
    switch(className.toLowerCase()) {
      case 'guerreiro': return 'text-white';
      case 'monge': return 'text-white';
      case 'ninja': return 'text-white';
      case 'bruxo': return 'text-white';
      case 'paladino': return 'text-white';
      case 'druida': return 'text-white';
      default: return 'text-gray-400';
    }
  };
  
  const sizeClass = getIconSize();
  const colorClass = getColor();
  
  const iconAnimationVariants = {
    idle: { rotate: 0 },
    hover: { 
      rotate: [0, 5, 0, -5, 0],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };
  
  const getClassIcon = () => {
    if (!className) return <Shield className={`${sizeClass} ${colorClass}`} />;
    
    const IconComponent = () => {
      switch (className.toLowerCase()) {
        case 'guerreiro': return <Sword className={`${sizeClass} ${colorClass}`} />;
        case 'monge': return <Hand className={`${sizeClass} ${colorClass}`} />;
        case 'ninja': return <Wind className={`${sizeClass} ${colorClass}`} />;
        case 'bruxo': return <Sparkles className={`${sizeClass} ${colorClass}`} />;
        case 'paladino': return <Shield className={`${sizeClass} ${colorClass}`} />;
        case 'druida': return <Leaf className={`${sizeClass} ${colorClass}`} />;
        default: return <Shield className={`${sizeClass} ${colorClass}`} />;
      }
    };
    
    if (animate) {
      return (
        <motion.div
          variants={iconAnimationVariants}
          initial="idle"
          animate="hover"
        >
          <IconComponent />
        </motion.div>
      );
    }
    
    return <IconComponent />;
  };
  
  return getClassIcon();
};

export default ClassIconSelector;
