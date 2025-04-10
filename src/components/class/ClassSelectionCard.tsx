
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Check, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ClassIconSelector from '@/components/profile/ClassIconSelector';
import { getBonusTypeIcon } from './ClassIconUtils';
import { cn } from '@/lib/utils';
import ParticleBackground from './ParticleBackground';

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
  const [isHovering, setIsHovering] = useState(false);
  
  // Get class styling based on class name
  const getClassColors = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro':
        return {
          gradient: 'bg-gradient-to-br from-red-600 via-red-500 to-red-700',
          text: 'text-red-500',
          shadow: 'shadow-[0_0_25px_rgba(239,68,68,0.6)]',
          border: 'border-red-600/40',
          hoverBorder: 'hover:border-red-500',
          accent: 'bg-red-600/20',
          indicator: 'bg-gradient-to-r from-red-500 to-red-600',
          progress: 'from-red-500/80 to-red-600/80',
          particleColor: '#ef4444'
        };
      case 'Monge':
        return {
          gradient: 'bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700',
          text: 'text-amber-500',
          shadow: 'shadow-[0_0_25px_rgba(245,158,11,0.6)]',
          border: 'border-amber-500/40',
          hoverBorder: 'hover:border-amber-500',
          accent: 'bg-amber-600/20',
          indicator: 'bg-gradient-to-r from-amber-500 to-amber-600',
          progress: 'from-amber-500/80 to-amber-600/80',
          particleColor: '#f59e0b'
        };
      case 'Ninja':
        return {
          gradient: 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700',
          text: 'text-emerald-500',
          shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.6)]',
          border: 'border-emerald-500/40',
          hoverBorder: 'hover:border-emerald-500',
          accent: 'bg-emerald-600/20',
          indicator: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
          progress: 'from-emerald-500/80 to-emerald-600/80',
          particleColor: '#10b981'
        };
      case 'Bruxo':
        return {
          gradient: 'bg-gradient-to-br from-violet-600 via-violet-500 to-violet-700',
          text: 'text-violet-500',
          shadow: 'shadow-[0_0_25px_rgba(139,92,246,0.6)]',
          border: 'border-violet-500/40',
          hoverBorder: 'hover:border-violet-500',
          accent: 'bg-violet-600/20',
          indicator: 'bg-gradient-to-r from-violet-500 to-violet-600',
          progress: 'from-violet-500/80 to-violet-600/80',
          particleColor: '#8b5cf6'
        };
      case 'Paladino':
        return {
          gradient: 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700',
          text: 'text-blue-500',
          shadow: 'shadow-[0_0_25px_rgba(59,130,246,0.6)]',
          border: 'border-blue-500/40',
          hoverBorder: 'hover:border-blue-500',
          accent: 'bg-blue-600/20',
          indicator: 'bg-gradient-to-r from-blue-500 to-blue-600',
          progress: 'from-blue-500/80 to-blue-600/80',
          particleColor: '#3b82f6'
        };
      default:
        return {
          gradient: 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800',
          text: 'text-gray-400',
          shadow: 'shadow-[0_0_25px_rgba(156,163,175,0.4)]',
          border: 'border-gray-500/30',
          hoverBorder: 'hover:border-gray-400',
          accent: 'bg-gray-600/20',
          indicator: 'bg-gradient-to-r from-gray-500 to-gray-600',
          progress: 'from-gray-500/80 to-gray-600/80',
          particleColor: '#9ca3af'
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
        formattedText: `${value} ${description}`,
        // Simulate progress for each bonus (in a real app, this would come from the backend)
        progress: Math.random() * 100
      };
    });
  };

  const colors = getClassColors();
  const bonuses = formatBonuses();
  
  const cardVariants = {
    initial: { scale: 1, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    hover: { 
      scale: 1.03,
      boxShadow: isCurrentClass ? 
        colors.shadow : 
        "0 10px 25px rgba(0, 0, 0, 0.2)"
    },
    selected: {
      scale: 1.02,
      boxShadow: colors.shadow
    },
    tap: { scale: 0.98 }
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.2, rotate: 10, transition: { type: "spring", stiffness: 300 } }
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: (progress: number) => ({ 
      width: `${progress}%`,
      transition: { duration: 1, ease: "easeOut" }
    })
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
          "overflow-hidden border backdrop-blur-sm transition-all duration-300 relative z-10",
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
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center">
              <motion.div 
                variants={iconVariants}
                className={`mr-4 ${colors.accent} p-3 rounded-xl border border-white/20 flex items-center justify-center backdrop-blur-sm`}
              >
                <ClassIconSelector className={classInfo.class_name} size="lg" />
              </motion.div>
              <div>
                <h3 className={`text-2xl font-bold orbitron-text text-white mb-1 tracking-wide`}>
                  {classInfo.class_name}
                  {isSelected && !isCurrentClass && (
                    <motion.span 
                      className="inline-block ml-2 text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.span>
                  )}
                </h3>
                <Badge variant="outline" className={`mt-1 text-white/90 border-white/30 backdrop-blur-sm`}>
                  {classInfo.description}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Bonus Section */}
          <div className="mt-5">
            <div className="flex items-center mb-3">
              <span className={`${colors.accent} rounded-full p-1.5 mr-2 border border-white/30 backdrop-blur-sm`}>
                <Star className={`h-4 w-4 text-white`} />
              </span>
              <span className={`text-sm font-medium text-white/90`}>Bônus Passivos</span>
            </div>
            
            <div className="space-y-3">
              {bonuses.map((bonus, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`transition-all duration-300 hover:translate-x-1 bg-black/20 backdrop-blur-sm rounded-lg p-3.5 border border-white/20`}>
                        <div className="flex items-center mb-2">
                          <div className={`flex-shrink-0 mr-3 ${colors.accent} p-2 rounded-full border border-white/30 backdrop-blur-sm`}>
                            {getBonusTypeIcon(bonus.bonus_type)}
                          </div>
                          <p className="text-sm font-sora text-white/90">
                            {bonus.formattedText}
                          </p>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden mt-1">
                          <motion.div 
                            className={`h-full rounded-full bg-gradient-to-r ${colors.progress}`}
                            variants={progressVariants}
                            initial="initial"
                            animate="animate"
                            custom={bonus.progress}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="backdrop-blur-md bg-black/80 border border-white/20">
                      <p className="text-xs">Progresso do bônus: {Math.round(bonus.progress)}%</p>
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
