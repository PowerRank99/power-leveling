
import React from 'react';
import { Check } from 'lucide-react';
import { ClassInfo } from '@/services/rpg/ClassService';
import { getClassIcon } from '@/components/class/ClassIconUtils';

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
  
  return (
    <div 
      className={`h-full rounded-xl overflow-hidden shadow-md transition-all duration-300 transform 
        ${isSelected ? 'ring-4 ring-fitblue ring-offset-2' : ''}
        ${isFocused ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-70'}
        ${isOnCooldown && !isCurrentClass ? 'opacity-60' : ''}
      `}
      onClick={onClick}
    >
      <div className={`bg-gradient-to-br ${classInfo.color} text-white p-5 h-full flex flex-col`}>
        <div className="flex items-start mb-3">
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-inner overflow-hidden">
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
              <h3 className="font-bold text-2xl">{classInfo.class_name}</h3>
              {isCurrentClass && (
                <span className="ml-2 bg-white/30 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Atual
                </span>
              )}
            </div>
            <p className="text-white/90">{classInfo.description}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-white/80 mb-2 flex items-center">
            <span className="bg-white/20 rounded-full p-1 mr-2">🔍</span> 
            Bônus Passivo
          </p>
          
          <div className="space-y-3 mb-3">
            {classInfo.bonuses.map((bonus, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-inner hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg font-bold mr-2 whitespace-nowrap">
                    {`+${Math.round(bonus.bonus_value * 100)}%`}
                  </span>
                  <p className="text-sm">{bonus.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSelectionCard;
