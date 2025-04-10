
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ClassIconSelector from '@/components/profile/ClassIconSelector';
import { getBonusTypeIcon } from './ClassIconUtils';

interface ClassSelectionCardProps {
  classInfo: {
    class_name: string;
    description: string;
    bonuses: Array<{
      bonus_type: string;
      bonus_value: number;
      description: string;
    }>;
  };
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
  // Get class styling based on class name
  const getClassColors = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro':
        return {
          border: 'border-red-600/40',
          hoverBorder: 'hover:border-red-500',
          accent: 'bg-red-600/15',
          text: 'text-red-500',
          shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
          gradient: 'bg-gradient-to-br from-red-600/20 to-red-700/10',
          indicator: 'bg-gradient-to-r from-red-500 to-red-600'
        };
      case 'Monge':
        return {
          border: 'border-amber-500/40',
          hoverBorder: 'hover:border-amber-500',
          accent: 'bg-amber-600/15',
          text: 'text-amber-500',
          shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
          gradient: 'bg-gradient-to-br from-amber-600/20 to-amber-700/10',
          indicator: 'bg-gradient-to-r from-amber-500 to-amber-600'
        };
      case 'Ninja':
        return {
          border: 'border-emerald-500/40',
          hoverBorder: 'hover:border-emerald-500',
          accent: 'bg-emerald-600/15',
          text: 'text-emerald-500',
          shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
          gradient: 'bg-gradient-to-br from-emerald-600/20 to-emerald-700/10',
          indicator: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
        };
      case 'Bruxo':
        return {
          border: 'border-violet-500/40',
          hoverBorder: 'hover:border-violet-500',
          accent: 'bg-violet-600/15',
          text: 'text-violet-500',
          shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]',
          gradient: 'bg-gradient-to-br from-violet-600/20 to-violet-700/10',
          indicator: 'bg-gradient-to-r from-violet-500 to-violet-600'
        };
      case 'Paladino':
        return {
          border: 'border-blue-500/40',
          hoverBorder: 'hover:border-blue-500',
          accent: 'bg-blue-600/15',
          text: 'text-blue-500',
          shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
          gradient: 'bg-gradient-to-br from-blue-600/20 to-blue-700/10',
          indicator: 'bg-gradient-to-r from-blue-500 to-blue-600'
        };
      default:
        return {
          border: 'border-gray-500/30',
          hoverBorder: 'hover:border-gray-400',
          accent: 'bg-gray-600/15',
          text: 'text-gray-400',
          shadow: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
          gradient: 'bg-gradient-to-br from-gray-700/20 to-gray-800/10',
          indicator: 'bg-gradient-to-r from-gray-500 to-gray-600'
        };
    }
  };

  // Format bonus text to include percentage in description
  const formatBonuses = () => {
    if (!classInfo.bonuses || classInfo.bonuses.length === 0) return [];
    
    return classInfo.bonuses.slice(0, 2).map(bonus => {
      const value = `+${Math.round(bonus.bonus_value * 100)}%`;
      const description = bonus.description;
      
      return {
        ...bonus,
        formattedText: `${value} ${description}`
      };
    });
  };

  const colors = getClassColors();
  const bonuses = formatBonuses();
  
  return (
    <motion.div
      whileHover={isOnCooldown ? {} : { scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={isOnCooldown ? {} : { scale: 0.99 }}
      className={`relative transition-all duration-300 ${isOnCooldown && !isCurrentClass ? 'opacity-70' : ''}`}
      onClick={isOnCooldown && !isCurrentClass ? undefined : onClick}
    >
      <Card
        className={`overflow-hidden ${colors.gradient} transition-all duration-300 ${
          isSelected
            ? `border-2 ${colors.border.replace('/40', '')} ${colors.shadow}`
            : isFocused
              ? `border ${colors.border} shadow-md` 
              : `border ${colors.border}`
        } ${isOnCooldown && !isCurrentClass ? 'opacity-70 grayscale-[30%]' : ''}`}
      >
        {isCurrentClass && (
          <div className={`h-1 w-full absolute top-0 left-0 ${colors.indicator}`} />
        )}
        
        <CardContent className="p-5">
          {/* Class Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className={`mr-3 ${colors.accent} p-2 rounded-lg border ${colors.border} flex items-center justify-center`}>
                <ClassIconSelector className={classInfo.class_name} size="md" />
              </div>
              <div>
                <h3 className={`text-xl font-bold orbitron-text ${colors.text}`}>
                  {classInfo.class_name}
                </h3>
                <Badge variant="outline" className={`mt-1 ${colors.text} border-opacity-40`}>
                  {classInfo.description}
                </Badge>
              </div>
            </div>
            
            {isCurrentClass && (
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${colors.accent} ${colors.text} border ${colors.border}`}>
                Atual
              </div>
            )}
          </div>
          
          {/* Bonus Section */}
          <div className="mt-5">
            <div className="flex items-center mb-3">
              <span className={`${colors.accent} rounded-full p-1 mr-2 border ${colors.border}`}>
                <Search className={`h-4 w-4 ${colors.text}`} />
              </span>
              <span className={`text-sm font-medium ${colors.text}`}>Bônus Passivo</span>
            </div>
            
            <div className="space-y-2.5">
              {bonuses.map((bonus, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center bg-midnight-elevated/80 backdrop-blur-sm rounded-lg p-3 border border-${colors.border.split('-')[1]}/20 transition-all hover:border-${colors.border.split('-')[1]}/30`}>
                        <div className={`flex-shrink-0 mr-3 ${colors.accent} p-1.5 rounded-full border ${colors.border}`}>
                          {getBonusTypeIcon(bonus.bonus_type)}
                        </div>
                        <p className="text-sm font-sora text-text-secondary">
                          {bonus.formattedText}
                        </p>
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
    </motion.div>
  );
};

export default ClassSelectionCard;
