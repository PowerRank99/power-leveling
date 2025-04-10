
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles } from 'lucide-react';

export const getClassIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sword': return <Sword className="h-6 w-6 text-white" />;
    case 'Dumbbell': return <Dumbbell className="h-6 w-6 text-white" />;
    case 'Wind': return <Wind className="h-6 w-6 text-white" />;
    case 'Sparkles': return <Sparkles className="h-6 w-6 text-white" />;
    case 'Shield': return <Shield className="h-6 w-6 text-white" />;
    default: return <Shield className="h-6 w-6 text-white" />;
  }
};
