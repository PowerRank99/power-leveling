
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  light?: boolean;
  animateValue?: boolean;
  color?: 'arcane' | 'valor' | 'xpgold' | 'energy' | 'restgreen';
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  value, 
  label, 
  light = false,
  animateValue = false,
  color = 'arcane'
}) => {
  // Determine color classes based on the color prop
  const getColorClass = () => {
    switch(color) {
      case 'valor': return 'text-valor';
      case 'xpgold': return 'text-xpgold';
      case 'energy': return 'text-energy';
      case 'restgreen': return 'text-restgreen';
      default: return 'text-arcane';
    }
  };
  
  const getGlowClass = () => {
    switch(color) {
      case 'valor': return 'shadow-glow-valor';
      case 'xpgold': return 'shadow-glow-xpgold';
      case 'energy': return 'shadow-glow-energy';
      default: return 'shadow-glow-md';
    }
  };
  
  return (
    <div className="flex flex-col items-center relative">
      {/* Add subtle particle effects for animated values */}
      {animateValue && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(2)].map((_, i) => (
            <div 
              key={i}
              className={`absolute w-1 h-1 ${color === 'xpgold' ? 'bg-xpgold' : color === 'energy' ? 'bg-energy' : 'bg-arcane'} rounded-full opacity-70`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `magic-particles ${1 + Math.random()}s ease-out`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <div className={`mb-1 transform transition-transform duration-300 ${animateValue ? 'animate-float' : 'hover:scale-110'}`}>
        {icon}
      </div>
      
      {value && (
        <span className={`text-xl font-ibm-plex font-bold tracking-wider ${light ? "text-ghostwhite" : "text-gray-800 dark:text-ghostwhite"} ${animateValue ? getColorClass() : ''} ${animateValue ? getGlowClass() : ''}`}>
          {value}
        </span>
      )}
      
      <span className={`text-xs font-sora ${light ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
};

export default StatCard;
