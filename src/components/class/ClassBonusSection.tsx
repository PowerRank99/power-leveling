
import React from 'react';
import { Shield } from 'lucide-react';
import ClassBonusItem from './ClassBonusItem';

interface ClassBonus {
  bonus_type: string;
  bonus_value: number;
  description: string;
  formattedText: string;
}

interface ClassBonusSectionProps {
  bonuses: ClassBonus[];
  accentColor: string;
}

const ClassBonusSection: React.FC<ClassBonusSectionProps> = ({ bonuses, accentColor }) => {
  return (
    <div className="mt-4">
      <div className="flex items-center mb-3">
        <span className={`${accentColor} rounded-full p-1.5 mr-2 border border-white/30`}>
          <Shield className={`h-4 w-4 text-white`} />
        </span>
        <span className={`text-sm font-medium text-white/90`}>Bônus Passivos</span>
      </div>
      
      <div className="space-y-3">
        {bonuses.map((bonus, index) => (
          <ClassBonusItem 
            key={index} 
            bonus={bonus} 
            accentColor={accentColor} 
          />
        ))}
      </div>
    </div>
  );
};

export default ClassBonusSection;
