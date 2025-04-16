
import React from 'react';
import { motion } from 'framer-motion';
import { ClassInfo } from '@/services/rpg/ClassService';
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

  return (
    <motion.div 
      className="hidden lg:grid lg:grid-cols-3 gap-8 mb-8 mt-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {classes.map((classInfo, index) => (
        <motion.div 
          key={`grid-${classInfo.class_name}`} 
          className="h-full"
          variants={itemVariants}
        >
          <ClassSelectionCard
            classInfo={classInfo}
            isCurrentClass={userClass === classInfo.class_name}
            isSelected={selectedClass === classInfo.class_name}
            isFocused={index === focusedIndex}
            isOnCooldown={isOnCooldown}
            onClick={() => {
              if (!isOnCooldown || userClass === classInfo.class_name) {
                onClassSelect(classInfo.class_name, index);
              }
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ClassDesktopGrid;
