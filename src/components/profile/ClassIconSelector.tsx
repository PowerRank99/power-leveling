
import React from 'react';
import { Sword, Wind, Sparkles, Shield, Dumbbell } from 'lucide-react';

interface ClassIconSelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ClassIconSelector: React.FC<ClassIconSelectorProps> = ({ 
  className, 
  size = 'md' 
}) => {
  // Determine icon size based on size prop
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      case 'md':
      default: return 'w-6 h-6';
    }
  };
  
  // Get color based on class
  const getColor = () => {
    if (!className) return 'text-gray-400';
    
    switch(className.toLowerCase()) {
      case 'guerreiro': return 'text-red-500';
      case 'monge': return 'text-amber-500';
      case 'ninja': return 'text-emerald-500';
      case 'bruxo': return 'text-violet-500';
      case 'paladino': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };
  
  const sizeClass = getIconSize();
  const colorClass = getColor();
  
  if (!className) return <Shield className={`${sizeClass} ${colorClass}`} />;
  
  switch (className.toLowerCase()) {
    case 'guerreiro': return <Sword className={`${sizeClass} ${colorClass}`} />;
    case 'monge': return <Dumbbell className={`${sizeClass} ${colorClass}`} />;
    case 'ninja': return <Wind className={`${sizeClass} ${colorClass}`} />;
    case 'bruxo': return <Sparkles className={`${sizeClass} ${colorClass}`} />;
    case 'paladino': return <Shield className={`${sizeClass} ${colorClass}`} />;
    default: return <Shield className={`${sizeClass} ${colorClass}`} />;
  }
};

export default ClassIconSelector;
