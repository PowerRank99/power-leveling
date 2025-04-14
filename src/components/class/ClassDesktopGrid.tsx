
import React from 'react';
import { motion } from 'framer-motion';
import { ClassInfo, LegacyClassInfo } from '@/services/rpg/types/classTypes';
import ClassSelectionCard from './ClassSelectionCard';

interface ClassDesktopGridProps {
  classes: ClassInfo[];
  selectedClass: string | null;
  userClass: string | null;
  isOnCooldown: boolean;
  focusedIndex: number;
  onClassSelect: (className: string, index: number) => void;
}

const ClassDesktopGrid: React.FC<ClassDesktopGridProps> = ({
  classes,
  selectedClass,
  userClass,
  isOnCooldown,
  focusedIndex,
  onClassSelect,
}) => {
  // Animation variants for grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Convert ClassInfo to LegacyClassInfo for backward compatibility with ClassSelectionCard
  const getLegacyClassInfo = (classInfo: ClassInfo): LegacyClassInfo => {
    return {
      class_name: classInfo.className,
      description: classInfo.description,
      icon: classInfo.icon,
      color: classInfo.color,
      bonuses: classInfo.bonuses.map(bonus => ({
        bonus_type: bonus.bonusType,
        bonus_value: bonus.bonusValue,
        description: bonus.description,
        skill_name: bonus.skillName
      }))
    };
  };

  return (
    <motion.div 
      className="hidden lg:grid lg:grid-cols-3 gap-8 mb-8 mt-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {classes.map((classInfo, index) => (
        <motion.div 
          key={`grid-${classInfo.className}`} 
          className="h-full"
          variants={itemVariants}
        >
          <ClassSelectionCard
            classInfo={getLegacyClassInfo(classInfo)}
            isCurrentClass={userClass === classInfo.className}
            isSelected={selectedClass === classInfo.className}
            isFocused={index === focusedIndex}
            isOnCooldown={isOnCooldown}
            onClick={() => {
              if (!isOnCooldown || userClass === classInfo.className) {
                onClassSelect(classInfo.className, index);
              }
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ClassDesktopGrid;
