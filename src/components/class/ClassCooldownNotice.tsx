
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface ClassCooldownNoticeProps {
  isOnCooldown: boolean;
  cooldownText: string;
}

const ClassCooldownNotice: React.FC<ClassCooldownNoticeProps> = ({
  isOnCooldown,
  cooldownText,
}) => {
  if (!isOnCooldown) return null;
  
  // Animation for the timer
  const timerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };
  
  // Animation for the pulsing card
  const cardVariants = {
    pulse: {
      boxShadow: [
        "0 0 10px rgba(239, 68, 68, 0.3)",
        "0 0 20px rgba(239, 68, 68, 0.5)",
        "0 0 10px rgba(239, 68, 68, 0.3)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      variants={cardVariants}
      animate="pulse"
    >
      <Card className="mb-4 overflow-hidden border border-valor/40 bg-gradient-to-r from-valor/10 to-valor/5 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="mr-3 bg-valor/20 rounded-full p-2 border border-valor/30">
              <motion.div variants={timerVariants} animate="animate">
                <Clock className="h-5 w-5 text-valor" />
              </motion.div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-valor mr-2" />
                <h3 className="font-semibold text-valor">Cooldown de Mudança</h3>
              </div>
              <p className="text-sm text-text-secondary mt-1">{cooldownText}</p>
              <p className="text-xs text-text-tertiary mt-2 italic">Você ainda pode selecionar sua classe atual.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassCooldownNotice;
