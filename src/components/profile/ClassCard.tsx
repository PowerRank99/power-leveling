
import React from 'react';
import { Shield } from 'lucide-react';

interface ClassBonus {
  description: string;
  value: string;
}

interface ClassCardProps {
  className: string;
  description: string;
  icon?: React.ReactNode;
  bonuses: ClassBonus[];
}

const ClassCard: React.FC<ClassCardProps> = ({
  className,
  description,
  icon = <Shield className="h-6 w-6 text-white" />,
  bonuses
}) => {
  return (
    <div className="rounded-lg bg-fitblue text-white p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-fitblue-700 rounded-lg flex items-center justify-center mr-3">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{className}</h3>
          <p className="text-sm text-blue-100">{description}</p>
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-blue-200 mb-2">🔍 Bônus Passivo</p>
        
        {bonuses.map((bonus, index) => (
          <div key={index} className="mb-3 bg-fitblue-800 rounded-lg p-3">
            <div className="flex items-start">
              <span className="text-lg font-semibold mr-2">{bonus.value}</span>
              <p className="text-sm flex-1">{bonus.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassCard;
