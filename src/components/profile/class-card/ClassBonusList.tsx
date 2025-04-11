
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star } from 'lucide-react';
import { getBonusTypeIcon } from '@/components/class/ClassIconUtils';

interface ClassBonusListProps {
  displayBonuses: Array<{description: string | React.ReactNode; value: string}>;
  classColors: {
    border: string;
    accent: string;
    shadow: string;
    textAccent: string;
  };
}

const ClassBonusList: React.FC<ClassBonusListProps> = ({ displayBonuses, classColors }) => {
  if (displayBonuses.length === 0) {
    return (
      <div className={`mb-3 bg-midnight-elevated backdrop-blur-sm rounded-lg p-3 shadow-subtle border ${classColors.border}`}>
        <p className="text-sm text-center text-text-tertiary font-sora">
          Carregando bonificações...
        </p>
      </div>
    );
  }

  // Get bonus icon based on description text
  const getBonusIconFromDescription = (description: string | React.ReactNode) => {
    if (typeof description !== 'string') return <Star className="h-5 w-5 text-white" />;
    
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('compost') || lowerDesc.includes('agachamento') || lowerDesc.includes('supino')) 
      return getBonusTypeIcon('compound_lifts');
    if (lowerDesc.includes('força')) 
      return getBonusTypeIcon('strength');
    if (lowerDesc.includes('peso corporal') || lowerDesc.includes('bodyweight')) 
      return getBonusTypeIcon('bodyweight');
    if (lowerDesc.includes('cardio') || lowerDesc.includes('hiit')) 
      return getBonusTypeIcon('cardio');
    if (lowerDesc.includes('flex') || lowerDesc.includes('yoga')) 
      return getBonusTypeIcon('flexibility');
    if (lowerDesc.includes('recup') || lowerDesc.includes('mobil')) 
      return getBonusTypeIcon('recovery');
    if (lowerDesc.includes('esport')) 
      return getBonusTypeIcon('sports');
    if (lowerDesc.includes('longo') || lowerDesc.includes('60 minutos')) 
      return getBonusTypeIcon('long_workouts');
    
    return <Star className="h-5 w-5 text-white" />;
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {displayBonuses.map((bonus, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`transition-all duration-300 hover:scale-105 bg-midnight-elevated backdrop-blur-sm rounded-lg p-3 shadow-subtle hover:${classColors.shadow} border ${classColors.border} flex items-center`}>
                <div className={`flex-shrink-0 mr-3 ${classColors.accent} p-1.5 rounded-full border ${classColors.border}`}>
                  {typeof bonus.description === 'string' ? getBonusIconFromDescription(bonus.description) : <Star className="h-5 w-5 text-white" />}
                </div>
                <div className="flex items-center flex-1">
                  <span className={`text-lg font-bold mr-2 whitespace-nowrap font-space ${classColors.textAccent} shadow-glow-subtle`}>{bonus.value}</span>
                  <p className="text-sm font-sora text-text-secondary">{bonus.description}</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Bônus aplicado automaticamente durante treinos</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default ClassBonusList;
