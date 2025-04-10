
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles } from 'lucide-react';
import { ClassService } from '@/services/rpg/ClassService';
import { Badge } from '@/components/ui/badge';

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

  // Better gradient mapping for RPG theme
  const getRpgGradient = () => {
    switch (className.toLowerCase()) {
      case 'guerreiro': return 'from-valor to-xpgold';
      case 'monge': return 'from-restgreen to-energy';
      case 'ninja': return 'from-energy to-arcane';
      case 'bruxo': return 'from-arcane to-valor';
      case 'paladino': return 'from-xpgold to-restgreen';
      default: return 'from-arcane-dark to-arcane';
    }
  };
  
  // Get glow effect class based on class type
  const getGlowClass = () => {
    switch (className.toLowerCase()) {
      case 'guerreiro': return 'shadow-glow-valor';
      case 'bruxo': return 'shadow-glow-md';
      case 'ninja': return 'shadow-glow-energy';
      case 'paladino': return 'shadow-glow-xpgold';
      case 'monge': return 'shadow-inner-glow';
      default: return 'shadow-glow-md';
    }
  };
  
  return (
    <div className={`rounded-xl bg-gradient-to-br ${getRpgGradient()} text-white p-4 shadow-md ${getGlowClass()} relative overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg`}>
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-40 h-40 bg-white/5 rounded-full blur-xl top-5 -left-20 animate-pulse"></div>
        <div className="absolute w-20 h-20 bg-white/10 rounded-full blur-lg -bottom-5 right-10 animate-pulse"></div>
        {/* Add magical runes or symbols */}
        <div className="absolute top-5 right-5 w-16 h-16 opacity-10">
          {className.toLowerCase() === 'bruxo' && (
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="0.5"/>
              <path d="M12 2L12 22M2 12L22 12M4 4L20 20M4 20L20 4" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          )}
          {className.toLowerCase() === 'guerreiro' && (
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path d="M12 2L16 12L22 14L16 16L12 22L8 16L2 14L8 12L12 2Z" stroke="currentColor" fill="none" strokeWidth="0.5"/>
            </svg>
          )}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-3">
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-inner overflow-hidden">
              {showAvatar ? (
                <img 
                  src={getClassAvatarImage()} 
                  alt={className}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="animate-glow-pulse">{cardIcon}</div>
              )}
            </div>
            {showAvatar && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                {cardIcon}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-xl tracking-wide">{className}</h3>
            <p className="text-sm text-blue-100 font-sora">{description}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Badge variant="outline" className="bg-midnight/30 border-white/20 mr-2">
              <Sparkles className="w-3 h-3 mr-1" />
            </Badge> 
            <p className="text-sm text-blue-200 font-sora">Bônus Passivo</p>
          </div>
          
          {bonuses.length > 0 ? (
            bonuses.map((bonus, index) => (
              <div 
                key={index} 
                className="mb-3 card-glass rounded-lg p-3 shadow-inner hover:bg-white/15 transition-colors transform hover:translate-y-[-2px] duration-200"
              >
                <div className="flex items-center">
                  <span className="text-lg font-bold mr-2 whitespace-nowrap font-space-grotesk tracking-wider animate-pulse">{bonus.value}</span>
                  <p className="text-sm font-sora">{bonus.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="mb-3 card-glass rounded-lg p-3 shadow-inner">
              <p className="text-sm text-center text-white/70 font-sora">
                {className === 'Sem Classe' 
                  ? 'Selecione uma classe para obter bônus' 
                  : 'Carregando bonificações...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
