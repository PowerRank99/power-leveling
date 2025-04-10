
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles } from 'lucide-react';

export const getClassIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sword': return <Sword className="h-6 w-6 text-xpgold" />;
    case 'Dumbbell': return <Dumbbell className="h-6 w-6 text-xpgold" />;
    case 'Wind': return <Wind className="h-6 w-6 text-xpgold" />;
    case 'Sparkles': return <Sparkles className="h-6 w-6 text-xpgold" />;
    case 'Shield': return <Shield className="h-6 w-6 text-xpgold" />;
    default: return <Shield className="h-6 w-6 text-xpgold" />;
  }
};
