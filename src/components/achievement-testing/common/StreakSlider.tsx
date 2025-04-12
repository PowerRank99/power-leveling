
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';

interface StreakSliderProps {
  streak: number;
  onChange: (value: number) => void;
  showMultiplier?: boolean;
}

const StreakSlider: React.FC<StreakSliderProps> = ({ 
  streak, 
  onChange,
  showMultiplier = true
}) => {
  const multiplier = XPCalculationService.getStreakMultiplier(streak);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="streakSlider">
          Streak: {streak} day{streak !== 1 ? 's' : ''}
        </Label>
        {showMultiplier && (
          <span className="text-sm font-space text-arcane">
            ({(multiplier).toFixed(2)}x multiplier)
          </span>
        )}
      </div>
      <Slider
        id="streakSlider"
        min={0}
        max={14}
        step={1}
        value={[streak]}
        onValueChange={(values) => onChange(values[0])}
        className="py-4"
      />
    </div>
  );
};

export default StreakSlider;
