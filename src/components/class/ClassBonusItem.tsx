
import React from 'react';
import { getBonusTypeIcon } from './ClassIconUtils';

interface ClassBonusItemProps {
  bonus: {
    bonus_type: string;
    bonus_value: number;
    description: string;
    formattedText: string;
  };
  accentColor: string;
}

const ClassBonusItem: React.FC<ClassBonusItemProps> = ({ bonus, accentColor }) => {
  return (
    <div className={`transition-all duration-300 hover:translate-x-1 bg-black/20 rounded-lg p-3.5 border border-white/20`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 mr-3 ${accentColor} p-2 rounded-full border border-white/30`}>
          {getBonusTypeIcon(bonus.bonus_type)}
        </div>
        <p className="text-sm font-sora text-white/90">
          {bonus.formattedText}
        </p>
      </div>
    </div>
  );
};

export default ClassBonusItem;
