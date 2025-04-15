
import React, { useEffect, useState } from 'react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Achievement } from '@/types/achievementTypes';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRankColorClass } from '@/utils/achievementUtils';
import { toast } from 'sonner';

const TestNotificationSimulator: React.FC = () => {
  const { notificationsQueue, removeNotification } = useTestingDashboard();
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  
  // Process notifications queue
  useEffect(() => {
    if (notificationsQueue.length > 0 && !showNotification) {
      // Take the first notification from the queue
      const notification = notificationsQueue[0];
      setCurrentNotification(notification);
      setShowNotification(true);
      
      // Remove it from the queue after a delay
      const timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => {
          removeNotification(notification.id);
          setCurrentNotification(null);
        }, 300); // Wait for exit animation
      }, 7000); // Show for 7 seconds
      
      return () => clearTimeout(timer);
    }
  }, [notificationsQueue, showNotification, removeNotification]);
  
  if (!currentNotification) return null;
  
  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          className="fixed top-16 right-4 z-50 max-w-sm w-full shadow-lg"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="rounded-lg border border-arcane-30 bg-midnight-card bg-opacity-95 backdrop-blur-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-arcane-15`}>
                  <Award className="h-5 w-5 text-arcane" />
                </div>
                <div>
                  <h3 className="font-orbitron text-md font-bold">Achievement Unlocked!</h3>
                  <Badge 
                    variant="outline" 
                    className={`mb-1 ${getRankColorClass(currentNotification.rank)}`}
                  >
                    Rank {currentNotification.rank}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => {
                  setShowNotification(false);
                  setTimeout(() => {
                    removeNotification(currentNotification.id);
                    setCurrentNotification(null);
                  }, 300);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <h4 className="mt-2 text-lg font-bold">{currentNotification.name}</h4>
            <p className="text-text-secondary text-sm mt-1">{currentNotification.description}</p>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-arcane font-semibold">
                +{currentNotification.xpReward} XP
              </div>
              <div className="text-xs text-text-tertiary">
                {currentNotification.points} achievement points
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TestNotificationSimulator;
