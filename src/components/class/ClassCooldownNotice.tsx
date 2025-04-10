
import React from 'react';
import { Timer } from 'lucide-react';

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
    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700 flex items-center gap-3 animate-pulse">
      <Timer className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
      <div>
        <p className="text-amber-800 dark:text-amber-300 font-medium">Mudança de classe em cooldown</p>
        <p className="text-amber-600 dark:text-amber-400 text-sm">Próxima mudança disponível em: {cooldownText}</p>
      </div>
    </div>
  );
};

export default ClassCooldownNotice;
