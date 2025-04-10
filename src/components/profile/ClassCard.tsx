
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles } from 'lucide-react';
import { ClassService } from '@/services/rpg/ClassService';

interface ClassBonus {
  description: string | React.ReactNode;
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
      case 'guerreiro': return <Sword className="h-6 w-6 text-white" />;
      case 'monge': return <Dumbbell className="h-6 w-6 text-white" />;
      case 'ninja': return <Wind className="h-6 w-6 text-white" />;
      case 'bruxo': return <Sparkles className="h-6 w-6 text-white" />;
      case 'paladino': return <Shield className="h-6 w-6 text-white" />;
      default: return <Shield className="h-6 w-6 text-white" />;
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
    <div className="class-card p-4 mt-4">
      <div className="flex items-center mb-3">
        <div className="relative">
          <div className="w-12 h-12 bg-midnight-elevated backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-subtle overflow-hidden border border-arcane-30">
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
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-arcane rounded-full flex items-center justify-center shadow-glow-purple">
              {cardIcon}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-orbitron font-bold text-xl text-text-primary tracking-tight">{className}</h3>
          <p className="text-sm text-text-secondary font-sora">{description}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-text-secondary mb-2 flex items-center font-sora">
          <span className="bg-arcane-15 rounded-full p-1 mr-2 border border-arcane-30 shadow-subtle">🔍</span> 
          Bônus Passivo
        </p>
        
        {bonuses.length > 0 ? (
          bonuses.map((bonus, index) => (
            <div key={index} className="mb-3 bg-midnight-elevated backdrop-blur-sm rounded-lg p-3 shadow-subtle hover:shadow-glow-purple transition-all duration-300 border border-arcane-30">
              <div className="flex items-center">
                <span className="text-lg font-bold mr-2 whitespace-nowrap font-space text-arcane shadow-glow-subtle">{bonus.value}</span>
                <p className="text-sm font-sora text-text-secondary">{bonus.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="mb-3 bg-midnight-elevated backdrop-blur-sm rounded-lg p-3 shadow-subtle border border-arcane-30">
            <p className="text-sm text-center text-text-tertiary font-sora">
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
