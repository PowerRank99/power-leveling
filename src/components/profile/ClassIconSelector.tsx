
import React from 'react';
import { Sword, Wind, Sparkles, Shield, Dumbbell } from 'lucide-react';

interface ClassIconSelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ClassIconSelector: React.FC<ClassIconSelectorProps> = ({ className, size = 'md' }) => {
  // Determine icon size based on the size prop
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      case 'md':
      default: return 'w-5 h-5';
    }
  };
  
  const sizeClass = getIconSize();
  
  if (!className) return <Shield className={`${sizeClass} text-white`} />;
  
  switch (className?.toLowerCase()) {
    case 'guerreiro': return <Sword className={`${sizeClass} text-white`} />;
    case 'monge': return <Dumbbell className={`${sizeClass} text-white`} />;
    case 'ninja': return <Wind className={`${sizeClass} text-white`} />;
    case 'bruxo': return <Sparkles className={`${sizeClass} text-white`} />;
    case 'paladino': return <Shield className={`${sizeClass} text-white`} />;
    default: return <Shield className={`${sizeClass} text-white`} />;
  }
};

export default ClassIconSelector;
