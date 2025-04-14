
import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { XPService } from '@/services/rpg/XPService';
import { POWER_DAY_BONUS_XP } from './useManualWorkoutSimulation';

interface ClassBonus {
  description: string;
  amount: number;
}

interface XPBreakdownPanelProps {
  totalXP: number;
  isPowerDay: boolean;
  classBonus: ClassBonus | null;
}

const XPBreakdownPanel: React.FC<XPBreakdownPanelProps> = ({
  totalXP,
  isPowerDay,
  classBonus
}) => {
  return (
    <div className="bg-midnight-card rounded-lg p-4 border border-divider/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-midnight-base/80 to-transparent z-10 pointer-events-none"></div>
      
      <div className="aspect-video bg-midnight-elevated rounded-md border border-divider flex items-center justify-center relative mb-3">
        <Camera className="h-12 w-12 text-text-tertiary absolute" />
        <div className="absolute inset-0 bg-midnight-base/50 flex items-center justify-center">
          <p className="text-text-secondary font-sora">Test Photo (Simulated)</p>
        </div>
      </div>
      
      <div className="space-y-3 z-20 relative">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Base XP:</span>
          <span className="font-space text-arcane">{XPService.MANUAL_WORKOUT_BASE_XP} XP</span>
        </div>
        
        {isPowerDay && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Power Day Bonus:</span>
            <span className="font-space text-achievement">+{POWER_DAY_BONUS_XP} XP</span>
          </div>
        )}
        
        {classBonus && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Class Bonus:</span>
            <div className="text-right">
              <span className="font-space text-arcane-60">+{classBonus.amount} XP</span>
              <div className="text-xs text-arcane-60 mt-1">{classBonus.description}</div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center border-t border-divider/20 pt-3 mt-1">
          <span className="text-text-secondary font-semibold">Total XP:</span>
          <motion.span 
            className="font-space text-lg text-arcane font-bold"
            key={totalXP}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            {totalXP} XP
          </motion.span>
        </div>
        
        <div className="text-xs text-text-tertiary mt-2">
          <p>Manual workouts require a photo in real usage.</p>
          {isPowerDay && <p className="text-achievement-60">Power Day increases XP cap to 500.</p>}
          {classBonus && (
            <p className="text-arcane-60">
              Bônus de classe aplicado com base no tipo de atividade selecionado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default XPBreakdownPanel;
