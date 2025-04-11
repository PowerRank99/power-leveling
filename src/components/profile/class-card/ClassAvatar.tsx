
import React from 'react';
import { getClassAvatarImage } from './classCardUtils';

interface ClassAvatarProps {
  className: string;
  showAvatar: boolean;
  icon: React.ReactNode;
  classColors: {
    border: string;
    accent: string;
    shadow: string;
  };
}

const ClassAvatar: React.FC<ClassAvatarProps> = ({ 
  className, 
  showAvatar, 
  icon,
  classColors 
}) => {
  return (
    <div className="relative">
      <div className={`w-12 h-12 bg-midnight-elevated backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-subtle overflow-hidden border ${classColors.border}`}>
        {showAvatar ? (
          <img 
            src={getClassAvatarImage(className)} 
            alt={className}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="animate-pulse">{icon}</div>
        )}
      </div>
      {showAvatar && (
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${classColors.accent} rounded-full flex items-center justify-center ${classColors.shadow}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default ClassAvatar;
