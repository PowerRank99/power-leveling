
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
      case 'blue': return 'bg-arcane-15 text-arcane';
      case 'green': return 'bg-arcane-15 text-arcane-60';
      case 'purple': return 'bg-valor-15 text-valor';
      case 'yellow': return 'bg-achievement-15 text-achievement';
      default: return 'bg-midnight-elevated text-text-tertiary';
    }
  };
  
  return (
    <div className="flex items-center p-4 border-b border-divider/30 last:border-0">
      <div className={`${getColorClass()} w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-glow-subtle`}>
        {icon}
      </div>
      
      <div className="flex-grow">
        <h3 className="font-bold text-base text-text-primary font-orbitron">{title}</h3>
        <p className="text-text-secondary text-sm font-sora">{description}</p>
      </div>
      
      <div className="text-text-tertiary text-sm font-space">
        {date}
      </div>
    </div>
  );
};

export default Achievement;
