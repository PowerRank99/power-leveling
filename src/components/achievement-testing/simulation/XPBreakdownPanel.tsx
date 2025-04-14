
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { XPService } from '@/services/xp/XPService';
import { POWER_DAY_BONUS_XP } from './hooks/useManualWorkoutXPCalculation';

interface XPBreakdownPanelProps {
  totalXP: number;
  isPowerDay: boolean;
  classBonus: {
    description: string;
    amount: number;
  } | null;
}

const XPBreakdownPanel: React.FC<XPBreakdownPanelProps> = ({ 
  totalXP, 
  isPowerDay, 
  classBonus 
}) => {
  const baseXP = XPService.MANUAL_WORKOUT_BASE_XP;
  const powerDayBonus = isPowerDay ? POWER_DAY_BONUS_XP : 0;
  
  return (
    <Card className="flex-grow border-arcane-30 shadow-none bg-midnight-card">
      <CardContent className="pt-6">
        <h3 className="text-lg font-orbitron mb-4">XP Breakdown</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-text-secondary">Base XP:</span>
            <span className="font-space text-arcane">{baseXP} XP</span>
          </div>
          
          {isPowerDay && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Power Day Bonus:</span>
              <span className="font-space text-arcane">+{POWER_DAY_BONUS_XP} XP</span>
            </div>
          )}
          
          {classBonus && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Class Bonus:</span>
              <span className="font-space text-arcane">+{classBonus.amount} XP</span>
            </div>
          )}
          
          <div className="pt-2 border-t border-divider/30 mt-2">
            <div className="flex justify-between font-bold">
              <span className="text-text-primary">Total XP:</span>
              <span className="font-space text-arcane-90">{totalXP} XP</span>
            </div>
          </div>
          
          {classBonus && (
            <div className="text-xs text-text-secondary mt-2 italic">
              {classBonus.description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default XPBreakdownPanel;
