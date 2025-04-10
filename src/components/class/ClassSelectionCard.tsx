
import React from 'react';
import { motion } from 'framer-motion';
import { ClassInfo } from '@/services/rpg/ClassService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Info, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ClassIconSelector from '@/components/profile/ClassIconSelector';

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
  onClick
}) => {
  const isAvailable = !isOnCooldown || isCurrentClass;
  
  const renderBonuses = () => {
    return classInfo.bonuses.map((bonus, index) => (
      <div key={index} className="flex justify-between text-sm">
        <span className="text-text-secondary">{bonus.description}</span>
        <span className="font-bold text-arcane">{bonus.value}</span>
      </div>
    ));
  };
  
  const getClassBadgeVariant = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'valor';
      case 'Monge': return 'secondary';
      case 'Ninja': return 'arcane';
      case 'Bruxo': return 'achievement';
      case 'Paladino': return 'destructive';
      default: return 'arcane';
    }
  };
  
  return (
    <motion.div
      whileHover={isAvailable ? { scale: 1.01 } : {}}
      whileTap={isAvailable ? { scale: 0.99 } : {}}
      className={`relative transition-all duration-300 ${isOnCooldown && !isCurrentClass ? 'opacity-70' : ''}`}
    >
      <Card
        className={`border overflow-hidden h-full transition-all duration-300 ${
          isSelected
            ? 'border-arcane shadow-glow-purple'
            : isFocused
              ? 'border-arcane-30 shadow-md'
              : 'border-divider'
        } ${
          isCurrentClass ? 'bg-gradient-to-br from-arcane-15 to-midnight-card' : ''
        } ${isOnCooldown && !isCurrentClass ? 'grayscale-[30%]' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-6 relative">
          {/* Class Name and Badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold orbitron-text tracking-wide text-text-primary">{classInfo.class_name}</h3>
            <Badge variant={getClassBadgeVariant() as any} className="font-space">
              {classInfo.category}
            </Badge>
          </div>
          
          {/* Class Icon */}
          <div className="flex justify-between items-start">
            <div className="mb-4 flex-1">
              <p className="text-sm text-text-secondary mb-4">{classInfo.description}</p>
              
              {/* Class Bonuses */}
              <div className="space-y-2 mb-4">
                {renderBonuses()}
              </div>
            </div>
            
            <motion.div
              className="w-20 h-20 flex-shrink-0 ml-4"
              animate={{ rotate: isSelected ? [0, 5, 0, -5, 0] : 0 }}
              transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatDelay: 1.5 }}
            >
              <div className={`w-20 h-20 flex items-center justify-center rounded-full p-1 ${
                isSelected ? 'bg-arcane-15 border border-arcane-30 shadow-glow-purple' : 'bg-midnight-elevated'
              }`}>
                <ClassIconSelector className={classInfo.class_name} size="lg" />
              </div>
            </motion.div>
          </div>
          
          {/* Action Button */}
          <div className="mt-2">
            {isCurrentClass ? (
              <div className="flex items-center justify-center rounded-md py-2 px-4 bg-arcane-15 border border-arcane-30 text-arcane shadow-glow-subtle">
                <Check className="w-4 h-4 mr-2" />
                <span className="font-medium">Classe Atual</span>
              </div>
            ) : isSelected ? (
              <Button 
                variant="arcane" 
                disabled={isOnCooldown}
                className="w-full"
              >
                Selecionar Classe
              </Button>
            ) : (
              <Button 
                variant="outline" 
                disabled={isOnCooldown}
                className="w-full hover:bg-arcane-15 hover:text-arcane transition-all"
              >
                Ver Detalhes
              </Button>
            )}
          </div>
          
          {/* Cooldown Indicator */}
          {isOnCooldown && !isCurrentClass && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-3 right-3 rounded-full bg-midnight-elevated px-2 py-1 text-xs flex items-center border border-valor-30">
                    <Clock className="w-3 h-3 mr-1 text-valor" />
                    <span className="font-space text-text-tertiary">Bloqueado</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Você precisa esperar para trocar de classe</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Current Class Indicator */}
          {isCurrentClass && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-arcane to-valor" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassSelectionCard;
