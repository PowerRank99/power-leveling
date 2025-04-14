
import React from 'react';

interface ClassBonusSectionProps {
  bonuses: { description: string; value: string; skillName?: string }[];
  accentColor: string;
}

const ClassBonusSection: React.FC<ClassBonusSectionProps> = ({ 
  bonuses, 
  accentColor 
}) => {
  if (!bonuses || bonuses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h4 className="font-bold text-xs uppercase tracking-wide mb-2 opacity-70">Passive Skills</h4>
      {bonuses.map((bonus, index) => (
        <div key={index} className="flex justify-between text-xs items-center">
          <span className="truncate pr-2">{bonus.description}</span>
          <span className={`font-bold ${accentColor}`}>{bonus.value}</span>
        </div>
      ))}
    </div>
  );
};

export default ClassBonusSection;
