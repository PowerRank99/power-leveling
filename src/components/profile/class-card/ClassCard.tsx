
import React from 'react';
import { Sword, Wind, Sparkles, Shield, Dumbbell, Star } from 'lucide-react';
import { ClassFlavorMap, getClassColors, consolidateBonuses } from './classCardUtils';
import ClassAvatar from './ClassAvatar';
import ClassCardHeader from './ClassCardHeader';
import ClassBonusList from './ClassBonusList';

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
  // Get default icon based on class
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
  
  const cardIcon = icon || getDefaultIcon();
  const classColors = getClassColors(className);
  const displayBonuses = consolidateBonuses(bonuses);
  
  // Get flavor text for the class
  const getFlavorText = () => {
    return ClassFlavorMap[className.toLowerCase()] || 'Siga sua jornada para evoluir suas habilidades.';
  };
  
  return (
    <div className={`class-card p-4 mt-4 transition-all duration-300 hover:${classColors.shadow} border ${classColors.border} ${classColors.gradientBg} hover:border-opacity-50 rounded-xl`}>
      <ClassCardHeader
        icon={<ClassAvatar 
          className={className} 
          showAvatar={showAvatar} 
          icon={cardIcon} 
          classColors={classColors} 
        />}
        className={className}
        description={description}
        classColors={classColors}
      />
      
      <div className="mt-4">
        <div className="flex items-center mb-2 font-sora">
          <span className={`${classColors.accent} rounded-full p-1 mr-2 border ${classColors.border} shadow-subtle ${classColors.iconBg}`}>
            <Star className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm text-text-secondary">Bônus Passivo</span>
        </div>
        
        <ClassBonusList 
          displayBonuses={displayBonuses.length > 0 ? displayBonuses : 
            className === 'Sem Classe' ? 
              [{ description: 'Selecione uma classe para obter bônus', value: '' }] : 
              []
          } 
          classColors={classColors} 
        />
        
        {/* Class flavor text */}
        <div className="mt-4 text-sm font-sora text-text-tertiary italic border-t border-divider pt-3">
          {getFlavorText()}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
