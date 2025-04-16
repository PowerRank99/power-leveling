
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ParticleBackground from './ParticleBackground';
import ClassHeader from './ClassHeader';
import ClassBonusSection from './ClassBonusSection';
import { getClassColors, formatBonuses } from './ClassCardUtils';

interface ClassSelectionCardProps {
  classInfo: {
    class_name: string;
    description: string;
    bonuses: Array<{
      bonus_type: string;
      bonus_value: number;
      description: string;
      skill_name?: string;
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
  const [isHovering, setIsHovering] = useState(false);
  
  const colors = getClassColors(classInfo.class_name);
  const bonuses = formatBonuses(classInfo.bonuses);
  
  const cardVariants = {
    initial: { scale: 1, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    hover: { 
      scale: 1.02,
      boxShadow: isCurrentClass ? 
        colors.shadow : 
        "0 10px 25px rgba(0, 0, 0, 0.2)"
    },
    selected: {
      scale: 1.01,
      boxShadow: colors.shadow
    },
    tap: { scale: 0.98 }
  };
  
  return (
    <motion.div
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      whileHover={isOnCooldown && !isCurrentClass ? {} : "hover"}
      whileTap={isOnCooldown && !isCurrentClass ? {} : "tap"}
      variants={cardVariants}
      initial="initial"
      animate={isSelected ? "selected" : "initial"}
      className={`relative transition-all duration-300 ${isOnCooldown && !isCurrentClass ? 'opacity-70' : ''}`}
      onClick={isOnCooldown && !isCurrentClass ? undefined : onClick}
    >
      <Card
        className={cn(
          "overflow-hidden border transition-all duration-300 relative z-10",
          colors.gradient,
          isSelected
            ? `border-2 border-white/30`
            : isFocused
              ? `border border-white/20 shadow-md` 
              : `border border-white/10`,
          isOnCooldown && !isCurrentClass ? 'opacity-70 grayscale-[30%]' : ''
        )}
      >
        {/* Animated particle background */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
          <ParticleBackground color={colors.particleColor} active={isHovering || isSelected} />
        </div>
        
        {/* Selection indicator */}
        {isCurrentClass && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center">
            <div className={`h-1.5 w-full ${colors.indicator}`} />
            <div className="absolute -top-2 transform translate-y-1/2 px-3 py-1 text-xs font-bold rounded-full bg-white text-gray-900 shadow-lg">
              ATUAL
            </div>
          </div>
        )}
        
        <CardContent className="p-6 z-10 relative">
          {/* Class Header */}
          <div className="flex justify-between items-start mb-4">
            <ClassHeader 
              className={classInfo.class_name}
              isSelected={isSelected}
              isCurrentClass={isCurrentClass}
              accentColor={colors.accent}
            />
          </div>
          
          {/* Bonus Section */}
          <ClassBonusSection 
            bonuses={bonuses} 
            accentColor={colors.accent} 
          />
          
          {/* Class description at bottom */}
          <div className="mt-5 pt-3 border-t border-white/10">
            <Badge variant="outline" className="w-full flex justify-center text-white/90 border-white/30 py-2">
              {classInfo.description}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassSelectionCard;
