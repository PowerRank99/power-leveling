
import React from 'react';

interface AchievementProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

const Achievement: React.FC<AchievementProps> = ({ 
  icon, 
  title, 
  description, 
  date,
  color
}) => {
  const getColorClass = () => {
    switch(color) {
      case 'blue': return 'bg-fitblue-100/10 text-fitblue-500';
      case 'green': return 'bg-fitgreen-100/10 text-fitgreen-500';
      case 'purple': return 'bg-fitpurple-100/10 text-fitpurple-500';
      case 'yellow': return 'bg-yellow-100/10 text-yellow-500';
      default: return 'bg-gray-100/10 text-gray-500';
    }
  };
  
  return (
    <div className="flex items-center p-4 border-b border-arcane/5 last:border-0">
      <div className={`${getColorClass()} w-10 h-10 rounded-full flex items-center justify-center mr-4`}>
        {icon}
      </div>
      
      <div className="flex-grow">
        <h3 className="font-medium text-sm text-ghostwhite/90">{title}</h3>
        <p className="text-gray-400/90 text-xs">{description}</p>
      </div>
      
      <div className="text-gray-400/80 text-xs font-ibm-plex">
        {date}
      </div>
    </div>
  );
};

export default Achievement;
