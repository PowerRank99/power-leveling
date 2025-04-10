
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles } from 'lucide-react';
import { ClassService } from '@/services/rpg/ClassService';

interface ClassBonus {
  description: string;
  value: string;
}

interface ClassCardProps {
  className: string;
  description: string;
  icon?: React.ReactNode;
  bonuses: ClassBonus[];
  showAvatar?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  className,
  description,
  icon,
  bonuses,
  showAvatar = false
}) => {
  // Use ClassService for gradient colors
  const gradientColors = ClassService.getClassColor(className);
  
  // Get appropriate icon based on class
  const getDefaultIcon = () => {
    switch (className.toLowerCase()) {
      case 'guerreiro': return <Sword className="h-6 w-6 text-xpgold" />;
      case 'monge': return <Dumbbell className="h-6 w-6 text-xpgold" />;
      case 'ninja': return <Wind className="h-6 w-6 text-xpgold" />;
      case 'bruxo': return <Sparkles className="h-6 w-6 text-xpgold" />;
      case 'paladino': return <Shield className="h-6 w-6 text-xpgold" />;
      default: return <Shield className="h-6 w-6 text-xpgold" />;
    }
  };
  
  // Get class avatar image
  const getClassAvatarImage = () => {
    // Default images for each class
    const avatarMap: Record<string, string> = {
      'guerreiro': '/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png',
      'monge': '/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png',
      'ninja': '/lovable-uploads/f018410c-9031-4726-b654-ec51c1bbd72b.png',
      'bruxo': '/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png',
      'paladino': '/lovable-uploads/7164b50e-55bc-43ae-9127-1c693ab31e70.png'
    };
    
    return avatarMap[className.toLowerCase()] || '/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png';
  };
  
  const cardIcon = icon || getDefaultIcon();
  
  return (
    <div className={`rounded-xl bg-gradient-to-br ${gradientColors} text-ghost p-4 shadow-lg relative overflow-hidden`}>
      <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] animate-shimmer opacity-20"></div>
      <div className="flex items-center mb-3 relative z-10">
        <div className="relative">
          <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-inner overflow-hidden">
            {showAvatar ? (
              <img 
                src={getClassAvatarImage()} 
                alt={className}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="animate-pulse">{cardIcon}</div>
            )}
          </div>
          {showAvatar && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
              {cardIcon}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-display text-xl tracking-wide">{className}</h3>
          <p className="text-sm text-ghost-300">{description}</p>
        </div>
      </div>
      
      <div className="mt-4 relative z-10">
        <p className="text-sm text-ghost-400 mb-2 flex items-center font-mono">
          <span className="bg-black/20 rounded-full p-1 mr-2">✧</span> 
          Bônus Passivo
        </p>
        
        {bonuses.length > 0 ? (
          bonuses.map((bonus, index) => (
            <div key={index} className="mb-3 bg-black/20 backdrop-blur-sm rounded-lg p-3 shadow-inner hover:bg-black/30 transition-colors">
              <div className="flex items-center">
                <span className="text-lg font-bold mr-2 whitespace-nowrap font-mono text-xpgold">{bonus.value}</span>
                <p className="text-sm">{bonus.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="mb-3 bg-black/20 backdrop-blur-sm rounded-lg p-3 shadow-inner">
            <p className="text-sm text-center text-ghost-400">
              {className === 'Sem Classe' 
                ? 'Selecione uma classe para obter bônus' 
                : 'Carregando bonificações...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
