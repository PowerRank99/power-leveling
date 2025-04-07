
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
      case 'blue': return 'bg-fitblue-100';
      case 'green': return 'bg-fitgreen-100';
      case 'purple': return 'bg-fitpurple-100';
      case 'yellow': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };
  
  return (
    <div className="flex items-center p-4 border-b border-gray-100 last:border-0">
      <div className={`${getColorClass()} w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
        {icon}
      </div>
      
      <div className="flex-grow">
        <h3 className="font-bold text-base">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      
      <div className="text-gray-400 text-sm">
        {date}
      </div>
    </div>
  );
};

export default Achievement;
