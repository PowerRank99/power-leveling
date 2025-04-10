
import React from 'react';
import { Check } from 'lucide-react';
import { ClassInfo } from '@/services/rpg/ClassService';
import { getClassIcon } from '@/components/class/ClassIconUtils';
import { motion } from 'framer-motion';

interface ClassSelectionCardProps {
  classInfo: ClassInfo;
  isCurrentClass: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isOnCooldown: boolean;
  onClick: () => void;
}

const ClassSelectionCard: React.FC<ClassSelectionCardProps> = ({
  classInfo,
  isCurrentClass,
  isSelected,
  isFocused,
  isOnCooldown,
  onClick,
}) => {
  // Get class avatar image
  const getClassAvatarImage = (className: string) => {
    // Default images for each class
    const avatarMap: Record<string, string> = {
      'Guerreiro': '/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png',
      'Monge': '/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png',
      'Ninja': '/lovable-uploads/f018410c-9031-4726-b654-ec51c1bbd72b.png',
      'Bruxo': '/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png',
      'Paladino': '/lovable-uploads/7164b50e-55bc-43ae-9127-1c693ab31e70.png'
    };
    
    return avatarMap[className] || '/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png';
  };
  
  // Only take the first 2 bonuses to display
  const displayBonuses = classInfo.bonuses.slice(0, 2);
  
  return (
    <motion.div 
      className={`h-full rounded-xl overflow-hidden shadow-elevated transition-all duration-300 transform cursor-pointer
        ${isSelected ? 'ring-4 ring-fitblue ring-offset-2' : ''}
        ${isFocused ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-70'}
        ${isOnCooldown && !isCurrentClass ? 'opacity-60' : ''}
      `}
      whileHover={{ scale: isFocused ? 1.02 : 0.92 }}
      whileTap={{ scale: isFocused ? 0.98 : 0.88 }}
      onClick={onClick}
    >
      <div className={`bg-gradient-to-br ${classInfo.color} text-white p-6 h-full flex flex-col`}>
        <div className="flex items-start mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4 shadow-inner overflow-hidden">
              <img 
                src={getClassAvatarImage(classInfo.class_name)} 
                alt={classInfo.class_name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
              {getClassIcon(classInfo.icon)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-bold text-2xl orbitron-text tracking-wider">{classInfo.class_name}</h3>
              {isCurrentClass && (
                <span className="ml-2 bg-white/30 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Atual
                </span>
              )}
            </div>
            <p className="text-white/90 mt-1 leading-relaxed">{classInfo.description}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-white/90 mb-3 flex items-center font-medium tracking-wide">
            <span className="bg-white/20 rounded-full p-1 mr-2 flex items-center justify-center w-6 h-6">
              {getBonusIcon(classInfo.class_name)}
            </span> 
            Bônus Passivo
          </p>
          
          <div className="space-y-3 mb-3">
            {displayBonuses.map((bonus, idx) => (
              <motion.div 
                key={idx} 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-inner hover:bg-white/15 transition-colors"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center">
                  <span className="text-lg font-bold mr-3 whitespace-nowrap font-space tracking-wide">
                    {`+${Math.round(bonus.bonus_value * 100)}%`}
                  </span>
                  <p className="text-sm leading-relaxed tracking-wide">{bonus.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to get appropriate icon for bonus type
const getBonusIcon = (className: string) => {
  switch (className) {
    case 'Guerreiro':
      return <span className="text-lg">💪</span>;
    case 'Monge':
      return <span className="text-lg">🧘</span>;
    case 'Ninja':
      return <span className="text-lg">🏃</span>;
    case 'Bruxo':
      return <span className="text-lg">✨</span>;
    case 'Paladino':
      return <span className="text-lg">🛡️</span>;
    default:
      return <span className="text-lg">⚔️</span>;
  }
};

export default ClassSelectionCard;
