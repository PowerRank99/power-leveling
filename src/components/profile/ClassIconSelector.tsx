
import React from 'react';
import { Sword, Wind, Sparkles, Shield, Dumbbell } from 'lucide-react';

interface ClassIconSelectorProps {
  className?: string;
}

const ClassIconSelector: React.FC<ClassIconSelectorProps> = ({ className }) => {
  if (!className) return <Shield className="w-5 h-5 text-white" />;
  
  switch (className) {
    case 'Guerreiro': return <Sword className="w-5 h-5 text-white" />;
    case 'Monge': return <Dumbbell className="w-5 h-5 text-white" />;
    case 'Ninja': return <Wind className="w-5 h-5 text-white" />;
    case 'Bruxo': return <Sparkles className="w-5 h-5 text-white" />;
    case 'Paladino': return <Shield className="w-5 h-5 text-white" />;
    default: return <Shield className="w-5 h-5 text-white" />;
  }
};

export default ClassIconSelector;
