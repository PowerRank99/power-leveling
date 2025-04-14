
import React from 'react';
import { LegacyClassInfo } from '@/services/rpg/types/classTypes';
import { motion } from 'framer-motion';
import ClassBonusSection from './ClassBonusSection';
import { getClassColors, formatBonuses } from './ClassCardUtils';
import { Shield, Sword, Wind, Sparkles, Dumbbell } from 'lucide-react';

interface ClassSelectionCardProps {
  classInfo: LegacyClassInfo;
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
  // Get class styling
  const classColors = getClassColors(classInfo.class_name);
  const formattedBonuses = formatBonuses(classInfo.bonuses);
  
  // Define card styles based on state
  const backgroundGradient = classInfo.class_name ? classColors.gradient : 'bg-midnight-card';
  const textColor = isSelected || isFocused ? 'text-white' : classColors.text;
  const shadowColor = (isSelected || isFocused) && !isOnCooldown ? classColors.shadow : '';
  const borderGradient = isOnCooldown && !isCurrentClass ? 'border-gray-700/50' : 'border-transparent';
  
  // Choose the appropriate icon based on class
  const getIcon = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro':
        return <Sword className={`h-5 w-5 ${textColor}`} />;
      case 'Monge':
        return <Dumbbell className={`h-5 w-5 ${textColor}`} />;
      case 'Ninja':
        return <Wind className={`h-5 w-5 ${textColor}`} />;
      case 'Bruxo':
        return <Sparkles className={`h-5 w-5 ${textColor}`} />;
      case 'Paladino':
        return <Shield className={`h-5 w-5 ${textColor}`} />;
      default:
        return <Shield className={`h-5 w-5 ${textColor}`} />;
    }
  };
  
  const classIcon = getIcon();
  
  // Animation variants for the card
  const cardVariants = {
    hidden: { scale: 1 },
    visible: { 
      scale: 1,
      transition: { duration: 0.2 }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };
  
  return (
    <motion.div
      className={`relative rounded-2xl shadow-lg overflow-hidden h-full ${shadowColor} ${borderGradient} border-2`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${backgroundGradient} opacity-80`}></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {classIcon}
            <h3 className={`ml-2 font-bold text-xl font-orbitron ${textColor}`}>{classInfo.class_name}</h3>
          </div>
          {isCurrentClass && (
            <div className="px-2 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider">
              Atual
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className={`text-sm mb-4 font-sora ${textColor}`}>{classInfo.description}</p>
        
        {/* Spacer */}
        <div className="flex-grow" />
        
        {/* Bonuses Section */}
        <ClassBonusSection 
          bonuses={formattedBonuses} 
          accentColor={classColors.accent} 
        />
      </div>
    </motion.div>
  );
};

export default ClassSelectionCard;
