
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles } from 'lucide-react';

interface ClassBonus {
  description: string;
  value: string;
}

interface ClassCardProps {
  className: string;
  description: string;
  icon?: React.ReactNode;
  bonuses: ClassBonus[];
}

const ClassCard: React.FC<ClassCardProps> = ({
  className,
  description,
  icon,
  bonuses
}) => {
  // Get appropriate gradient color based on class
  const getClassGradient = (className: string) => {
    switch (className.toLowerCase()) {
      case 'guerreiro': return 'from-red-600 to-red-800';
      case 'monge': return 'from-amber-600 to-amber-800';
      case 'ninja': return 'from-green-600 to-green-800';
      case 'bruxo': return 'from-purple-600 to-purple-800';
      case 'paladino': return 'from-blue-600 to-blue-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };
  
  // Get default icon if none provided
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
  const gradientColors = getClassGradient(className);
  
  return (
    <div className={`rounded-xl bg-gradient-to-r ${gradientColors} text-white p-4 shadow-md`}>
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-inner">
          {cardIcon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{className}</h3>
          <p className="text-sm text-blue-100">{description}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-blue-200 mb-2 flex items-center">
          <span className="bg-white/20 rounded-full p-1 mr-2">🔍</span> 
          Bônus Passivo
        </p>
        
        {bonuses.length > 0 ? (
          bonuses.map((bonus, index) => (
            <div key={index} className="mb-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-inner hover:bg-white/15 transition-colors">
              <div className="flex items-center">
                <span className="text-lg font-bold mr-2 whitespace-nowrap">{bonus.value}</span>
                <p className="text-sm">{bonus.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="mb-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-inner">
            <p className="text-sm text-center text-white/70">
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
