
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconBgClass } from '@/utils/achievementUtils';

interface AchievementNotificationProps {
  title: string;
  description: string;
  rank: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | string;
  xpReward: number;
  points: number;
  bonusText?: string;
  isVisible: boolean;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  title,
  description,
  rank = 'E',
  xpReward,
  points,
  bonusText,
  isVisible,
  onClose
}) => {
  // Auto-hide after delay
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  // Get the appropriate styling based on rank
  const bgClass = getIconBgClass(rank);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-md w-full"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        >
          <div className="rounded-lg shadow-xl overflow-hidden bg-midnight-card border border-arcane-30">
            <div className="p-4">
              <div className="flex items-start">
                {/* Icon */}
                <div className={`${bgClass} rounded-full p-3 mr-3 flex-shrink-0`}>
                  <Trophy size={20} />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-text-primary">{title}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-text-tertiary hover:text-text-primary" 
                      onClick={onClose}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{description}</p>
                  
                  {/* XP Badge */}
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-1 bg-achievement-15 text-achievement text-xs rounded-full font-medium">
                      +{xpReward} XP
                    </span>
                    
                    {/* Points Badge */}
                    {points > 0 && (
                      <span className="px-2 py-1 bg-valor-15 text-valor text-xs rounded-full font-medium">
                        {points} pontos
                      </span>
                    )}
                    
                    {/* Rank Badge */}
                    <span className="px-2 py-1 bg-arcane-15 text-arcane text-xs rounded-full font-medium">
                      Rank {rank}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bonus text if provided */}
            {bonusText && (
              <div className="bg-valor-15 px-4 py-2 text-sm text-valor text-center font-medium border-t border-valor-30">
                {bonusText}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
