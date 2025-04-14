
import React from 'react';
import { motion } from 'framer-motion';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { XPService } from '@/services/rpg/XPService';

interface XPBreakdownDisplayProps {
  xpBreakdown: {
    timeXP: number;
    exerciseXP: number;
    setXP: number;
    difficultyMultiplier: number;
    streakMultiplier: number;
    prBonus: number;
    baseXP: number;
  };
  bonusBreakdown: Array<{skill: string, amount: number, description: string}>;
  totalXP: number;
  exerciseCount: number;
  includePersonalRecord: boolean;
  duration: number;
}

const XPBreakdownDisplay: React.FC<XPBreakdownDisplayProps> = ({
  xpBreakdown,
  bonusBreakdown,
  totalXP,
  exerciseCount,
  includePersonalRecord,
  duration
}) => {
  return (
    <div className="bg-midnight-card rounded-lg p-4 border border-divider/30 flex-grow">
      <h3 className="text-md font-orbitron mb-2 text-text-primary">XP Breakdown</h3>
      
      <div className="space-y-4">
        <div className="border-b border-divider/20 pb-2">
          <p className="text-sm font-semibold text-text-secondary mb-2">Base Calculations:</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-text-secondary">Time XP:</div>
            <div className="text-right font-space text-arcane">{xpBreakdown.timeXP} XP</div>
            
            <div className="text-text-secondary">Exercise XP:</div>
            <div className="text-right font-space text-arcane">
              {exerciseCount} × {XPService.BASE_EXERCISE_XP} = {xpBreakdown.exerciseXP} XP
            </div>
            
            <div className="text-text-secondary">Set XP:</div>
            <div className="text-right font-space text-arcane">
              {Math.min(exerciseCount * 3, XPCalculationService.MAX_XP_CONTRIBUTING_SETS)} × {XPService.BASE_SET_XP} = {xpBreakdown.setXP} XP
            </div>
          </div>
        </div>
        
        <div className="border-b border-divider/20 pb-2">
          <p className="text-sm font-semibold text-text-secondary mb-2">Multipliers:</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-text-secondary">Base Subtotal:</div>
            <div className="text-right font-space text-arcane">
              {xpBreakdown.timeXP + xpBreakdown.exerciseXP + xpBreakdown.setXP} XP
            </div>
            
            <div className="text-text-secondary">Difficulty:</div>
            <div className="text-right font-space text-arcane-60">
              {xpBreakdown.difficultyMultiplier.toFixed(1)}×
            </div>
            
            <div className="text-text-secondary">Base XP:</div>
            <div className="text-right font-space text-arcane-60 font-bold">
              {xpBreakdown.baseXP} XP
            </div>
            
            <div className="text-text-secondary">Streak:</div>
            <div className="text-right font-space text-arcane-60">
              {xpBreakdown.streakMultiplier.toFixed(2)}×
            </div>
          </div>
        </div>
        
        {includePersonalRecord && (
          <div className="border-b border-divider/20 pb-2">
            <p className="text-sm font-semibold text-text-secondary mb-2">Bonuses:</p>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="text-text-secondary">Personal Record:</div>
              <div className="text-right font-space text-achievement">+{xpBreakdown.prBonus} XP</div>
            </div>
          </div>
        )}
        
        {bonusBreakdown.length > 0 && (
          <div className="border-b border-divider/20 pb-2">
            <p className="text-sm font-semibold text-text-secondary mb-2">Class Bonuses:</p>
            {bonusBreakdown.map((bonus, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-text-secondary">{bonus.description}:</div>
                <div className={`text-right font-space ${bonus.amount >= 0 ? 'text-arcane' : 'text-red-500'}`}>
                  {bonus.amount >= 0 ? '+' : ''}{bonus.amount} XP
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-text-secondary font-semibold">Total XP:</span>
          <motion.span 
            className="font-space text-lg text-arcane font-bold"
            key={`total-${totalXP}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {totalXP} XP
          </motion.span>
        </div>
        
        <div className="text-xs text-text-tertiary mt-4">
          <p>Achievements will be unlocked based on:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>First workout (if applicable)</li>
            <li>Workout count milestones</li>
            <li>Streak achievements</li>
            {includePersonalRecord && <li>Personal record achievements</li>}
            {duration >= 60 && <li>Long workout achievements</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default XPBreakdownDisplay;
