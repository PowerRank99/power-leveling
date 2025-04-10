
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClassCooldownNoticeProps {
  isOnCooldown: boolean;
  cooldownText: string;
}

const ClassCooldownNotice: React.FC<ClassCooldownNoticeProps> = ({ 
  isOnCooldown, 
  cooldownText 
}) => {
  if (!isOnCooldown) return null;
  
  // Extract days for animation
  const getDays = () => {
    const match = cooldownText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };
  
  return (
    <motion.div 
      className="mb-6 bg-amber-950/20 p-4 rounded-lg border border-amber-500/30 flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex-shrink-0">
        <Clock className="h-6 w-6 text-amber-400" />
        <motion.div 
          className="absolute inset-0 bg-amber-400/20 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.2, 0.6] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
      </div>
      
      <div>
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
          <p className="text-amber-100 font-medium">Mudança de classe em cooldown</p>
        </div>
        <div className="flex items-center mt-1">
          <p className="text-amber-200/90 text-sm">
            Próxima mudança disponível em: 
            <span className="font-space font-medium ml-1">{cooldownText}</span>
          </p>
        </div>
        
        {/* Progressive countdown bar */}
        {getDays() > 0 && (
          <div className="mt-2 w-full bg-amber-900/30 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className="bg-amber-500 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${100 - (getDays() / 15) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClassCooldownNotice;
