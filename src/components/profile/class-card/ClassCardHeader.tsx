
import React from 'react';

interface ClassCardHeaderProps {
  icon: React.ReactNode;
  className: string;
  description: string;
  classColors: {
    textAccent: string;
  };
}

const ClassCardHeader: React.FC<ClassCardHeaderProps> = ({ 
  icon, 
  className, 
  description, 
  classColors 
}) => {
  return (
    <div className="flex items-center mb-3">
      {icon}
      <div>
        <h3 className={`orbitron-text font-bold text-xl ${classColors.textAccent}`}>{className}</h3>
        <p className="text-sm text-text-secondary font-sora">{description}</p>
      </div>
    </div>
  );
};

export default ClassCardHeader;
