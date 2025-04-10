
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface ClassCooldownNoticeProps {
  isOnCooldown: boolean;
  cooldownText: string;
}

const ClassCooldownNotice: React.FC<ClassCooldownNoticeProps> = ({ 
  isOnCooldown, 
  cooldownText 
}) => {
  if (!isOnCooldown) return null;
  
  return (
    <div className="mb-6 bg-valor-500/20 backdrop-blur-sm p-4 rounded-lg border border-valor-500/30 flex items-center gap-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-valor-500/10 to-transparent animate-pulse"></div>
      <div className="relative">
        <div className="bg-valor-500/20 backdrop-blur-sm rounded-full p-2">
          <Clock className="h-5 w-5 text-valor-500" />
        </div>
      </div>
      <div className="relative">
        <p className="text-valor-300 font-medium font-display tracking-wide">Mudança de classe em cooldown</p>
        <p className="text-ghost-300 text-sm flex items-center">
          <AlertCircle className="h-3 w-3 mr-1 text-valor-400" />
          Próxima mudança disponível em: {cooldownText}
        </p>
      </div>
    </div>
  );
};

export default ClassCooldownNotice;
