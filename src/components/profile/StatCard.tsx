
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
  // Determine color classes based on the color prop with refined muted tones
  const getColorClass = () => {
    switch(color) {
      case 'valor': return 'text-valor-muted';
      case 'xpgold': return 'text-xp-gold-muted';
      case 'energy': return 'text-energy-muted';
      case 'restgreen': return 'text-restgreen';
      default: return 'text-arcane-muted';
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
      {/* Refined subtle particle effects for animated values */}
      {animateValue && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
          {[...Array(1)].map((_, i) => (
            <div 
              key={i}
              className={`absolute w-0.5 h-0.5 ${color === 'xpgold' ? 'bg-xp-gold-muted' : color === 'energy' ? 'bg-energy-muted' : 'bg-arcane-muted'} rounded-full opacity-60`}
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

      <div className={`mb-1 transform transition-transform duration-300 ${animateValue ? 'animate-float' : 'hover:scale-105'}`}>
        {icon}
      </div>
      
      {value && (
        <span className={`text-lg font-ibm-plex font-medium tracking-wider ${light ? "text-ghostwhite/90" : "text-gray-800 dark:text-ghostwhite/90"} ${animateValue ? getColorClass() : ''} ${animateValue ? getGlowClass() : ''}`}>
          {value}
        </span>
      )}
      
      <span className={`text-xs font-sora ${light ? "text-blue-100/80" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
};

export default StatCard;
