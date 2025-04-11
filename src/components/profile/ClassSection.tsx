
import React from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useClass } from '@/contexts/ClassContext';
import { ClassService } from '@/services/rpg/ClassService';
import ClassIconSelector from './ClassIconSelector';
import { getBonusTypeIcon } from '../class/ClassIconUtils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { CLASS_PASSIVE_SKILLS } from '@/services/rpg/constants/exerciseTypes';

interface ClassBonus {
  description: string;
  value: string;
  skillName?: string;
}

interface ClassSectionProps {
  className: string;
  classDescription?: string;
  icon?: React.ReactNode;
  bonuses?: { description: string; value: string; skillName?: string }[];
}

const ClassSection: React.FC<ClassSectionProps> = ({
  className,
  classDescription,
  icon,
  bonuses = []
}) => {
  const navigate = useNavigate();
  const { userClass } = useClass();
  
  // Use the class from context if available
  const activeClass = userClass || className;
  const description = classDescription || ClassService.getClassDescription(activeClass);
  
  // Get passive skill names
  const getPassiveSkills = () => {
    if (!activeClass) return { primary: '', secondary: '' };
    
    const upperClassName = activeClass.toUpperCase() as keyof typeof CLASS_PASSIVE_SKILLS;
    
    if (upperClassName in CLASS_PASSIVE_SKILLS) {
      return {
        primary: CLASS_PASSIVE_SKILLS[upperClassName].PRIMARY,
        secondary: CLASS_PASSIVE_SKILLS[upperClassName].SECONDARY
      };
    }
    
    return { primary: '', secondary: '' };
  };
  
  const passiveSkills = getPassiveSkills();
  
  // Get styling based on class
  const getClassStyling = () => {
    switch((activeClass || '').toLowerCase()) {
      case 'guerreiro':
        return {
          border: 'border-red-600/30',
          text: 'text-red-500',
          accent: 'bg-red-600/15',
          gradient: 'bg-gradient-to-br from-red-600/10 to-red-700/5'
        };
      case 'monge':
        return {
          border: 'border-amber-500/30',
          text: 'text-amber-500',
          accent: 'bg-amber-600/15',
          gradient: 'bg-gradient-to-br from-amber-600/10 to-amber-700/5'
        };
      case 'ninja':
        return {
          border: 'border-emerald-500/30',
          text: 'text-emerald-500',
          accent: 'bg-emerald-600/15',
          gradient: 'bg-gradient-to-br from-emerald-600/10 to-emerald-700/5'
        };
      case 'bruxo':
        return {
          border: 'border-violet-500/30',
          text: 'text-violet-500',
          accent: 'bg-violet-600/15',
          gradient: 'bg-gradient-to-br from-violet-600/10 to-violet-700/5'
        };
      case 'paladino':
        return {
          border: 'border-blue-500/30',
          text: 'text-blue-500',
          accent: 'bg-blue-600/15',
          gradient: 'bg-gradient-to-br from-blue-600/10 to-blue-700/5'
        };
      default:
        return {
          border: 'border-gray-400/30',
          text: 'text-gray-400',
          accent: 'bg-gray-500/15',
          gradient: 'bg-gradient-to-br from-gray-700/10 to-gray-800/5'
        };
    }
  };

  // Process bonuses - add skill names and limit to maximum 2
  const processedBonuses = bonuses && bonuses.length > 0 
    ? bonuses.slice(0, 2).map((bonus, index) => ({
        ...bonus,
        description: typeof bonus.description === 'string' && bonus.value
          ? `${bonus.value} ${bonus.description.replace(/^\+\d+% /, '')}`
          : bonus.description,
        skillName: index === 0 ? passiveSkills.primary : passiveSkills.secondary
      }))
    : [{ description: activeClass ? 'Carregando bônus...' : 'Selecione uma classe para ver os bônus', value: '' }];

  const styling = getClassStyling();
  const classIcon = icon || <ClassIconSelector className={activeClass} size="md" />;

  return (
    <Card className={`mt-3 shadow-sm hover:shadow transition-all duration-300 border ${styling.border} overflow-hidden`}>
      <CardHeader className={`px-4 py-3 flex flex-row justify-between items-center border-b ${styling.border} ${styling.gradient}`}>
        <div className="flex items-center">
          <h3 className={`font-orbitron font-bold text-lg ${styling.text}`}>
            Classe
          </h3>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/classes')}
          className={`text-sm font-medium ${styling.text} hover:${styling.accent}`}
        >
          {activeClass ? 'Trocar Classe' : 'Escolher Classe'}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Class info */}
        <div className="flex items-center mt-2">
          <div className={`flex items-center justify-center w-12 h-12 ${styling.accent} rounded-lg mr-3 border ${styling.border}`}>
            {classIcon}
          </div>
          <div>
            <h3 className={`text-xl font-bold orbitron-text ${styling.text}`}>
              {activeClass || 'Sem Classe'}
            </h3>
            <p className="text-sm text-text-secondary font-sora">
              {description || 'Escolha uma classe para obter bônus'}
            </p>
          </div>
        </div>
        
        {/* Bonuses */}
        <div className="mt-5">
          <div className="flex items-center mb-2">
            <span className={`${styling.accent} rounded-full p-1 mr-2 border ${styling.border}`}>
              <Search className={`h-4 w-4 ${styling.text}`} />
            </span>
            <span className={`text-sm font-medium ${styling.text}`}>Bônus Passivo</span>
          </div>
          
          <div className="space-y-2.5">
            {processedBonuses.map((bonus, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex flex-col bg-midnight-elevated/80 backdrop-blur-sm rounded-lg p-3 border ${styling.border} transition-all hover:scale-[1.01]`}>
                      {typeof bonus.description === 'string' && bonus.description.includes('Carregando') ? (
                        <div className="animate-pulse w-full h-5 bg-gray-700/50 rounded"></div>
                      ) : (
                        <>
                          {bonus.skillName && (
                            <span className={`text-xs font-orbitron font-semibold mb-1.5 ${styling.text} border-b border-white/10 pb-1`}>
                              {bonus.skillName}
                            </span>
                          )}
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 mr-3 ${styling.accent} p-1.5 rounded-full border ${styling.border}`}>
                              {typeof bonus.description === 'string' && bonus.description.toLowerCase().includes('força') ? 
                                getBonusTypeIcon('strength') : 
                                typeof bonus.description === 'string' && bonus.description.toLowerCase().includes('corpo') ? 
                                  getBonusTypeIcon('bodyweight') : 
                                  <Search className={`h-4 w-4 ${styling.text}`} />
                              }
                            </div>
                            <p className="text-sm font-sora text-text-secondary">
                              {bonus.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Bônus aplicado automaticamente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassSection;
